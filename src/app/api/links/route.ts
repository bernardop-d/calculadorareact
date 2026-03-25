import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const links = await prisma.creatorLink.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ links });
  } catch (err) {
    console.error("[PUBLIC LINKS GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
