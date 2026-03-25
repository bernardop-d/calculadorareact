import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { endpoint, p256dh, auth } = body;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, userId: user.id },
      create: { userId: user.id, endpoint, p256dh, auth },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUSH SUBSCRIBE]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint obrigatório" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUSH UNSUBSCRIBE]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
