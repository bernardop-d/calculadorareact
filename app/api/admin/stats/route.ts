import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const [totalUsers, activeSubscriptions, totalPosts, totalRevenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.post.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "succeeded" },
      }),
    ]);

  return NextResponse.json({
    totalUsers,
    activeSubscriptions,
    totalPosts,
    totalRevenue: totalRevenue._sum.amount ?? 0,
  });
}
