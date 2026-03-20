import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { messageSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getAuthUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { userId } = await params;
    if (!userId) return NextResponse.json({ error: "userId inválido" }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: userId, toUserId: admin.id },
          { fromUserId: admin.id, toUserId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: { fromUser: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await prisma.message.updateMany({
      where: { fromUserId: userId, toUserId: admin.id, readAt: null },
      data: { readAt: new Date() },
    });

    const fan = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    return NextResponse.json({ messages, fan });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getAuthUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { userId } = await params;
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { fromUserId: admin.id, toUserId: userId, body: parsed.data.body },
      include: { fromUser: { select: { id: true, name: true, avatarUrl: true } } },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
