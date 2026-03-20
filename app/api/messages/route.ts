import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { messageSchema } from "@/lib/validations";

async function getAdminId(): Promise<string | null> {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
  return admin?.id ?? null;
}

export async function GET(_req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (user.role === "ADMIN") return NextResponse.json({ error: "Use /api/admin/messages" }, { status: 400 });

    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ messages: [] });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: user.id, toUserId: adminId },
          { fromUserId: adminId, toUserId: user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: { fromUser: { select: { id: true, name: true, avatarUrl: true } } },
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: { fromUserId: adminId, toUserId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Use /api/admin/messages/[userId]" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Sistema indisponível" }, { status: 503 });

  const message = await prisma.message.create({
    data: { fromUserId: user.id, toUserId: adminId, body: parsed.data.body },
    include: { fromUser: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}
