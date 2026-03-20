import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // Get all unique fans who sent messages
  const rawMessages = await prisma.message.findMany({
    where: { toUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: { fromUser: { select: { id: true, name: true, avatarUrl: true, email: true } } },
  });

  // Group by sender
  const convMap = new Map<string, { user: typeof rawMessages[0]["fromUser"]; lastMessage: (typeof rawMessages)[0]; unreadCount: number }>();
  for (const msg of rawMessages) {
    if (!convMap.has(msg.fromUserId)) {
      convMap.set(msg.fromUserId, { user: msg.fromUser, lastMessage: msg, unreadCount: 0 });
    }
    if (!msg.readAt) {
      convMap.get(msg.fromUserId)!.unreadCount++;
    }
  }

  const totalUnread = Array.from(convMap.values()).reduce((sum, c) => sum + c.unreadCount, 0);

  return NextResponse.json({
    conversations: Array.from(convMap.values()),
    totalUnread,
  });
}
