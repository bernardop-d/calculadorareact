import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id: storyId } = await params;

  await prisma.storyView.upsert({
    where: { storyId_userId: { storyId, userId: user.id } },
    update: {},
    create: { storyId, userId: user.id },
  });

  return NextResponse.json({ success: true });
}
