import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const [profile, totalPosts, activeFans, recentPosts] = await Promise.all([
    prisma.creatorProfile.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton", name: "Queen Rayalla" },
    }),
    prisma.post.count({ where: { published: true } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { media: { orderBy: { order: "asc" }, take: 1 } },
    }),
  ]);

  const name = profile?.name ?? "Queen Rayalla";
  const bio =
    profile?.bio ??
    "Conteúdo exclusivo feito com vontade e sem vergonha. Só pra quem tem coragem de entrar.";
  const avatarUrl = profile?.avatarUrl ?? null;

  return NextResponse.json({
    name,
    username: name.toLowerCase().replace(/\s+/g, ""),
    avatarUrl,
    coverUrl: profile?.coverUrl ?? null,
    bio,
    stats: { totalPosts, activeFans },
    recentPosts: recentPosts.map((p: (typeof recentPosts)[number]) => ({
      id: p.id,
      title: p.title,
      thumbnail: p.media[0]?.url ?? null,
      isPremium: p.isPremium,
      likeCount: p.likeCount,
    })),
  });
}
