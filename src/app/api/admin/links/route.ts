import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(_req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const links = await prisma.creatorLink.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ links });
  } catch (err) {
    console.error("[ADMIN LINKS GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const body = await req.json();
    const { title, url, emoji, order, active } = body;

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Título e URL são obrigatórios" }, { status: 400 });
    }

    const link = await prisma.creatorLink.create({
      data: {
        title: title.trim(),
        url: url.trim(),
        emoji: emoji?.trim() || null,
        order: typeof order === "number" ? order : 0,
        active: typeof active === "boolean" ? active : true,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (err) {
    console.error("[ADMIN LINKS POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
