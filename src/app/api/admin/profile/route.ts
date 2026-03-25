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

    const profile = await prisma.creatorProfile.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton", name: "Queen Rayalla" },
    });

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[PROFILE GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const body = await req.json();
    const { name, bio, avatarUrl, coverUrl } = body;

    const profile = await prisma.creatorProfile.upsert({
      where: { id: "singleton" },
      update: {
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(typeof bio === "string" ? { bio: bio.trim() || null } : {}),
        ...(typeof avatarUrl === "string" ? { avatarUrl: avatarUrl.trim() || null } : {}),
        ...(typeof coverUrl === "string" ? { coverUrl: coverUrl.trim() || null } : {}),
      },
      create: {
        id: "singleton",
        name: typeof name === "string" && name.trim() ? name.trim() : "Queen Rayalla",
        bio: typeof bio === "string" ? bio.trim() || null : null,
        avatarUrl: typeof avatarUrl === "string" ? avatarUrl.trim() || null : null,
        coverUrl: typeof coverUrl === "string" ? coverUrl.trim() || null : null,
      },
    });

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[PROFILE PUT]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
