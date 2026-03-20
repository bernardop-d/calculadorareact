import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();

    const [count, liked] = await Promise.all([
      prisma.like.count({ where: { postId: id } }),
      user
        ? prisma.like.findUnique({ where: { postId_userId: { postId: id, userId: user.id } } })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({ count, liked: !!liked });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { id: postId } = await params;

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { postId_userId: { postId, userId: user.id } } }),
        prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } }),
      ]);
      const count = await prisma.like.count({ where: { postId } });
      return NextResponse.json({ liked: false, count });
    }

    await prisma.$transaction([
      prisma.like.create({ data: { postId, userId: user.id } }),
      prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
    ]);
    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: true, count });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
