import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();

    const post = await prisma.post.findUnique({
      where: { id, published: true },
      include: {
        media: { orderBy: { order: "asc" } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    const isActive = user
      ? isSubscriptionActive(user.subscription?.status)
      : false;

    if (post.isPremium && !isActive) {
      return NextResponse.json(
        { error: "Assinatura necessária", locked: true },
        { status: 403 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[POST_GET]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
