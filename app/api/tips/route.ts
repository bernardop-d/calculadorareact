import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrRetrieveCustomer, createPaymentIntent } from "@/lib/stripe";
import { tipSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ error: "Admin não pode enviar gorjeta" }, { status: 400 });

  const body = await req.json();
  const parsed = tipSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const customerId = await createOrRetrieveCustomer(user.id, user.email, user.name);
  const intent = await createPaymentIntent(customerId, parsed.data.amount, "brl", {
    type: "TIP",
    userId: user.id,
    message: parsed.data.message ?? "",
  });

  await prisma.tip.create({
    data: {
      fromUserId: user.id,
      stripePaymentIntentId: intent.id,
      amount: parsed.data.amount,
      message: parsed.data.message,
      status: "pending",
    },
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}

export async function GET(_req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const tips = await prisma.tip.findMany({
    where: { status: "succeeded" },
    orderBy: { createdAt: "desc" },
    include: { fromUser: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ tips });
}
