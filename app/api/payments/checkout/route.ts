import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createOrRetrieveCustomer, createCheckoutSession } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const plan = body.plan as "basic" | "premium" | undefined;

    const priceId =
      plan === "basic"
        ? (process.env.STRIPE_PRICE_ID_BASIC ?? process.env.STRIPE_PRICE_ID!)
        : (process.env.STRIPE_PRICE_ID_PREMIUM ?? process.env.STRIPE_PRICE_ID!);

    const customerId = await createOrRetrieveCustomer(user.id, user.email, user.name);
    const base = getBaseUrl();

    const session = await createCheckoutSession(
      customerId,
      user.id,
      priceId,
      `${base}/dashboard?payment=success`,
      `${base}/payment`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
