import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ count: 0 }, { status: 403 });
  }

  const count = await prisma.message.count({
    where: { toUserId: user.id, readAt: null },
  });

  return NextResponse.json({ count });
}
