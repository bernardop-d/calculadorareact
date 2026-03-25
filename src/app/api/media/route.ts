import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSignedMediaUrl, isRemoteStorage } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "IMAGE" | "VIDEO" | null (all)
    const cursor = searchParams.get("cursor");
    const limit = 18;

    const isActive = user ? isSubscriptionActive(user.subscription?.status) : false;
    const planTier = user?.subscription?.planTier ?? null;

    const where: Record<string, unknown> = {
      post: { published: true },
    };
    if (type === "IMAGE") where.type = "IMAGE";
    if (type === "VIDEO") where.type = "VIDEO";

    const media = await prisma.media.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            isPremium: true,
            contentTier: true,
            unlocksAfterDays: true,
            _count: { select: { media: true } },
          },
        },
      },
    });

    const hasMore = media.length > limit;
    const result = hasMore ? media.slice(0, limit) : media;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    const formatted = await Promise.all(
      result.map(async (m) => {
        const post = m.post;
        let locked = false;
        if (!isActive) {
          locked = post.isPremium;
        } else if (post.contentTier === "PREMIUM" && planTier === "BASIC") {
          locked = true;
        }

        let url: string | null = m.url;
        if (!locked && isRemoteStorage() && !m.url.startsWith("/")) {
          url = await getSignedMediaUrl(m.url, 3600);
        } else if (locked) {
          url = m.url; // still pass it, component will blur it
        }

        return {
          id: m.id,
          url,
          type: m.type,
          postId: post.id,
          mediaCount: post._count.media,
          locked,
        };
      })
    );

    return NextResponse.json({ media: formatted, nextCursor }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
