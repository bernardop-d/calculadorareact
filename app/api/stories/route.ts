import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const user = await getAuthUser();
  const now = new Date();

  // Fire-and-forget cleanup of expired stories
  prisma.story.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => {});

  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    include: user
      ? { views: { where: { userId: user.id }, select: { id: true } } }
      : undefined,
  });

  return NextResponse.json({
    stories: stories.map((s) => ({
      id: s.id,
      mediaUrl: s.mediaUrl,
      mediaType: s.mediaType,
      caption: s.caption,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
      viewed: user ? (s.views?.length ?? 0) > 0 : false,
    })),
  });
}
