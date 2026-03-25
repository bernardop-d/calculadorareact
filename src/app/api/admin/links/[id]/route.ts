import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { title, url, emoji, order, active } = body;

    const link = await prisma.creatorLink.update({
      where: { id },
      data: {
        ...(typeof title === "string" && title.trim() ? { title: title.trim() } : {}),
        ...(typeof url === "string" && url.trim() ? { url: url.trim() } : {}),
        ...(typeof emoji === "string" ? { emoji: emoji.trim() || null } : {}),
        ...(typeof order === "number" ? { order } : {}),
        ...(typeof active === "boolean" ? { active } : {}),
      },
    });

    return NextResponse.json({ link });
  } catch (err) {
    console.error("[ADMIN LINKS PUT]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { id } = await params;
    await prisma.creatorLink.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN LINKS DELETE]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
