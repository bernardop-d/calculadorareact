import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Delete file from disk
  try {
    const filePath = path.join(process.cwd(), "public", story.mediaUrl);
    await unlink(filePath);
  } catch {
    // File may already be gone
  }

  await prisma.story.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
