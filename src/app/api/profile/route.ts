import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getOrCreateCreatorProfile() {
  const existing = await prisma.creatorProfile.findUnique({ where: { id: "singleton" } });
  if (existing) return existing;
  try {
    return await prisma.creatorProfile.create({
      data: { id: "singleton", name: "Queen Rayalla" },
    });
  } catch {
    const retry = await prisma.creatorProfile.findUnique({ where: { id: "singleton" } });
    if (retry) return retry;
    throw new Error("Não foi possível criar ou ler CreatorProfile");
  }
}

export async function GET(_req: NextRequest) {
  try {
  const [profile, totalPosts, activeFans, recentPosts] = await Promise.all([
    getOrCreateCreatorProfile(),
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
    "The most greedy and insatiable by cock, is inviting you to sign your account at onlyfans😈🔥📸🎥🎬🎞️ don't waste time, we will feel pleasure together I promise to make you enjoy a lot with my erotic content! 🔥🔥🔥🔥";
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
  } catch (err) {
    console.error("[PROFILE_GET]", err);
    return NextResponse.json(
      { error: "Erro ao carregar perfil" },
      { status: 500 }
    );
  }
}
