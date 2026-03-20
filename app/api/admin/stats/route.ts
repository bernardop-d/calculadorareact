import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeSubscriptions,
    totalPosts,
    revenueData,
    newFansThisWeek,
    cancelledLast30,
    topPosts,
    revenueThisMonth,
    totalTips,
    unreadMessages,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.post.count({ where: { published: true } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "succeeded" } }),
    prisma.subscription.count({ where: { status: "ACTIVE", createdAt: { gte: oneWeekAgo } } }),
    prisma.subscription.count({ where: { status: "CANCELLED", cancelledAt: { gte: thirtyDaysAgo } } }),
    prisma.post.findMany({
      orderBy: { likeCount: "desc" },
      take: 5,
      select: { id: true, title: true, likeCount: true, _count: { select: { comments: true } } },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "succeeded", createdAt: { gte: startOfMonth } } }),
    prisma.tip.aggregate({ _sum: { amount: true }, where: { status: "succeeded" } }),
    prisma.message.count({ where: { readAt: null, toUserId: user.id } }),
  ]);

  const churnRate =
    activeSubscriptions + cancelledLast30 > 0
      ? Math.round((cancelledLast30 / (activeSubscriptions + cancelledLast30)) * 100)
      : 0;

  return NextResponse.json({
    totalUsers,
    activeSubscriptions,
    totalPosts,
    totalRevenue: revenueData._sum.amount ?? 0,
    newFansThisWeek,
    cancelledLast30,
    churnRate,
    topPosts,
    revenueThisMonth: revenueThisMonth._sum.amount ?? 0,
    totalTips: totalTips._sum.amount ?? 0,
    unreadMessages,
  });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
