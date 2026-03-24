import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrRetrieveCustomer, createPaymentIntent } from "@/lib/stripe";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || !post.ppvPrice) {
    return NextResponse.json({ error: "Post não disponível para compra" }, { status: 400 });
  }

  // Already subscribed — no need to pay PPV
  if (isSubscriptionActive(user.subscription?.status)) {
    return NextResponse.json({ error: "Você já tem acesso via assinatura" }, { status: 400 });
  }

  // Already purchased
  const existing = await prisma.postPurchase.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });
  if (existing?.status === "succeeded") {
    return NextResponse.json({ error: "Você já adquiriu este conteúdo" }, { status: 400 });
  }

  const customerId = await createOrRetrieveCustomer(user.id, user.email, user.name);
  const intent = await createPaymentIntent(customerId, post.ppvPrice, "brl", {
    type: "PPV",
    userId: user.id,
    postId,
  });

  // Upsert pending purchase
  await prisma.postPurchase.upsert({
    where: { postId_userId: { postId, userId: user.id } },
    update: { stripePaymentIntentId: intent.id, amount: post.ppvPrice, status: "pending" },
    create: { postId, userId: user.id, stripePaymentIntentId: intent.id, amount: post.ppvPrice, status: "pending" },
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}
