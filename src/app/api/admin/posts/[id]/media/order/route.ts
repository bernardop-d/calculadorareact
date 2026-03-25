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

    const { id: postId } = await params;
    const body = await req.json();
    const { mediaIds } = body;

    if (!Array.isArray(mediaIds)) {
      return NextResponse.json({ error: "mediaIds deve ser um array" }, { status: 400 });
    }

    await Promise.all(
      mediaIds.map((mediaId: string, index: number) =>
        prisma.media.update({
          where: { id: mediaId, postId },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[MEDIA ORDER PUT]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
