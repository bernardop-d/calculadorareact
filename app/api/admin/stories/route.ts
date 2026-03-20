import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(_req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { views: true } } },
  });

  return NextResponse.json({ stories });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;

  if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

  const isVideo = file.type.startsWith("video/");
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `story_${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "stories");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const story = await prisma.story.create({
    data: {
      mediaUrl: `/uploads/stories/${filename}`,
      mediaType: isVideo ? "VIDEO" : "IMAGE",
      caption: caption || null,
      expiresAt,
    },
  });

  return NextResponse.json({ story }, { status: 201 });
}
