import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        post: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await req.json();
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
