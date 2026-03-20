import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        subscription: { select: { status: true, currentPeriodEnd: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({ users, total });
}
