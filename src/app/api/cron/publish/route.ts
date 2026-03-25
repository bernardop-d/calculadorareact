import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const posts = await prisma.post.findMany({
      where: {
        published: false,
        scheduledAt: { lte: now },
      },
      select: { id: true, title: true },
    });

    if (posts.length === 0) {
      return NextResponse.json({ published: 0, message: "Nothing to publish" });
    }

    await prisma.post.updateMany({
      where: {
        id: { in: posts.map((p) => p.id) },
      },
      data: { published: true },
    });

    return NextResponse.json({ published: posts.length, posts: posts.map((p) => p.id) });
  } catch (err) {
    console.error("[CRON/PUBLISH]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
