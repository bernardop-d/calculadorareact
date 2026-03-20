import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { commentSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = 20;

    const comments = await prisma.comment.findMany({
      where: { postId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    const hasMore = comments.length > limit;
    const result = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return NextResponse.json({ comments: result, nextCursor });
  } catch {
    return NextResponse.json({ comments: [], nextCursor: null });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { id: postId } = await params;
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { postId, userId: user.id, body: parsed.data.body },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
