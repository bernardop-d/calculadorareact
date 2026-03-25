import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { name: true, avatarUrl: true, bio: true, email: true },
  });

  const [totalPosts, activeFans, recentPosts] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { media: { orderBy: { order: "asc" }, take: 1 } },
    }),
  ]);

  return NextResponse.json({
    name: admin?.name ?? "Queen Rayalla",
    username: (admin?.name ?? "queenrayalla").toLowerCase().replace(/\s+/g, ""),
    avatarUrl: admin?.avatarUrl ?? "/creator.jpg",
    bio: admin?.bio ?? "Conteúdo exclusivo feito com vontade e sem vergonha. Só pra quem tem coragem de entrar.",
    stats: { totalPosts, activeFans },
    recentPosts: recentPosts.map((p) => ({
      id: p.id,
      title: p.title,
      thumbnail: p.media[0]?.url ?? null,
      isPremium: p.isPremium,
      likeCount: p.likeCount,
    })),
  });
}
