import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSignedMediaUrl, isR2Configured } from "@/lib/storage";

async function signMedia(media: { url: string }[]) {
  if (!isR2Configured()) return media;
  return Promise.all(
    media.map(async (m) => ({
      ...m,
      url: m.url.startsWith("/") ? m.url : await getSignedMediaUrl(m.url, 3600),
    }))
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();

    const post = await prisma.post.findUnique({
      where: { id, published: true },
      include: { media: { orderBy: { order: "asc" } } },
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    const isActive = user ? isSubscriptionActive(user.subscription?.status) : false;

    if (post.isPremium && !isActive) {
      return NextResponse.json(
        { error: "Assinatura necessária", locked: true },
        { status: 403 }
      );
    }

    const signedMedia = await signMedia(post.media);

    return NextResponse.json({ post: { ...post, media: signedMedia } });
  } catch (error) {
    console.error("[POST_GET]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
