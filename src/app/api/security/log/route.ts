import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_EVENTS = [
  "PRINT_SCREEN",
  "SCREEN_SHARE",
  "DEVTOOLS",
  "FOCUS_LOSS",
  "KEYBOARD_BLOCK",
] as const;

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const { event, postId } = body;
  if (!ALLOWED_EVENTS.includes(event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  await prisma.securityEvent.create({
    data: {
      userId: user.id,
      event,
      postId: postId ?? null,
      metadata: JSON.stringify({ ua, ip }),
    },
  });

  return NextResponse.json({ ok: true });
}
