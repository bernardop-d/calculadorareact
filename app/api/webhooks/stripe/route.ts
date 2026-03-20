import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendWinBackEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[WEBHOOK] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          const userId = session.metadata?.userId;
          if (!userId) break;
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(userId, subscription);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;
        await upsertSubscription(userId, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
        if (!user) break;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paymentId = (invoice as any).payment_intent ?? invoice.id;
        await prisma.payment.upsert({
          where: { stripePaymentId: paymentId as string },
          update: { status: "succeeded" },
          create: {
            userId: user.id,
            stripePaymentId: paymentId as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "succeeded",
            description: "Assinatura mensal",
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
        if (!user) break;
        await prisma.subscription.updateMany({ where: { userId: user.id }, data: { status: "PAST_DUE" } });
        break;
      }

      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const { type, userId, postId } = intent.metadata ?? {};

        if (type === "PPV" && userId && postId) {
          await prisma.postPurchase.updateMany({
            where: { stripePaymentIntentId: intent.id },
            data: { status: "succeeded" },
          });
          await prisma.payment.create({
            data: {
              userId,
              stripePaymentId: intent.id,
              amount: intent.amount,
              currency: intent.currency,
              status: "succeeded",
              description: "Compra de conteúdo PPV",
            },
          });
        }

        if (type === "TIP" && userId) {
          await prisma.tip.updateMany({
            where: { stripePaymentIntentId: intent.id },
            data: { status: "succeeded" },
          });
          await prisma.payment.create({
            data: {
              userId,
              stripePaymentId: intent.id,
              amount: intent.amount,
              currency: intent.currency,
              status: "succeeded",
              description: "Gorjeta enviada",
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const { type } = intent.metadata ?? {};
        if (type === "PPV") {
          await prisma.postPurchase.updateMany({ where: { stripePaymentIntentId: intent.id }, data: { status: "failed" } });
        }
        if (type === "TIP") {
          await prisma.tip.updateMany({ where: { stripePaymentIntentId: intent.id }, data: { status: "failed" } });
        }
        break;
      }
    }
  } catch (error) {
    console.error("[WEBHOOK] Handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Cron-style win-back processor — call GET /api/webhooks/stripe/winback (admin only)
async function upsertSubscription(userId: string, subscription: Stripe.Subscription) {
  const statusMap: Record<string, "ACTIVE" | "INACTIVE" | "CANCELLED" | "PAST_DUE"> = {
    active: "ACTIVE",
    trialing: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELLED",
    unpaid: "PAST_DUE",
    incomplete: "INACTIVE",
    incomplete_expired: "CANCELLED",
    paused: "INACTIVE",
  };

  const status = statusMap[subscription.status] ?? "INACTIVE";
  const item = subscription.items.data[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any;
  const periodStart = sub.current_period_start ?? sub.billing_cycle_anchor ?? Math.floor(Date.now() / 1000);
  const periodEnd = sub.current_period_end ?? periodStart + 30 * 24 * 60 * 60;

  const planTier =
    item.price.id === process.env.STRIPE_PRICE_ID_BASIC ? "BASIC" : "PREMIUM";

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: item.price.id,
      planTier,
      status,
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: item.price.id,
      planTier,
      status,
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

// Win-back processor
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const candidates = await prisma.subscription.findMany({
    where: { status: "CANCELLED", cancelledAt: { lte: threeDaysAgo }, winBackSent: false },
    include: { user: { select: { email: true } } },
  });

  const code = process.env.WINBACK_COUPON_CODE ?? "VOLTARAYALLA";
  await Promise.allSettled(
    candidates.map(async (sub) => {
      await sendWinBackEmail(sub.user.email, code);
      await prisma.subscription.update({ where: { id: sub.id }, data: { winBackSent: true } });
    })
  );

  return NextResponse.json({ processed: candidates.length });
}
