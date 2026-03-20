import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit") || "12"), 50);

    const isActive = user ? isSubscriptionActive(user.subscription?.status) : false;
    const planTier = user?.subscription?.planTier ?? null;

    const posts = await prisma.post.findMany({
      where: { published: true },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        media: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { media: true, comments: true } },
        ...(user
          ? { likes: { where: { userId: user.id }, select: { id: true } } }
          : {}),
      },
    });

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    // Check time-lock for subscriber
    const subscriptionStart = user?.subscription?.currentPeriodStart ?? null;

    const formattedPosts = result.map((post) => {
      let locked = false;

      if (!isActive) {
        locked = post.isPremium;
      } else {
        // Tier check
        if (post.contentTier === "PREMIUM" && planTier === "BASIC") locked = true;
        // Time-lock check
        if (!locked && post.unlocksAfterDays && subscriptionStart) {
          const daysSince =
            (Date.now() - new Date(subscriptionStart).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < post.unlocksAfterDays) locked = true;
        }
      }

      return {
        id: post.id,
        title: post.title,
        description: post.description,
        isPremium: post.isPremium,
        contentTier: post.contentTier,
        ppvPrice: post.ppvPrice,
        likeCount: post.likeCount,
        likedByMe: user ? (post.likes?.length ?? 0) > 0 : false,
        commentCount: post._count.comments,
        createdAt: post.createdAt,
        mediaCount: post._count.media,
        thumbnail: post.media[0]?.url ?? null,
        locked,
      };
    });

    return NextResponse.json({ posts: formattedPosts, nextCursor });
  } catch (error) {
    console.error("[POSTS_GET]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
