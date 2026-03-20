import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const isActive = user
      ? isSubscriptionActive(user.subscription?.status)
      : false;

    const posts = await prisma.post.findMany({
      where: { published: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        media: {
          orderBy: { order: "asc" },
          take: 1,
        },
        _count: { select: { media: true } },
      },
    });

    const total = await prisma.post.count({ where: { published: true } });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      isPremium: post.isPremium,
      createdAt: post.createdAt,
      mediaCount: post._count.media,
      thumbnail:
        !post.isPremium || isActive
          ? post.media[0]?.url ?? null
          : null,
      locked: post.isPremium && !isActive,
    }));

    return NextResponse.json({ posts: formattedPosts, total, page, limit });
  } catch (error) {
    console.error("[POSTS_GET]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
