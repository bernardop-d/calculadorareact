import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id: postId } = await params;

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", postId);
  await mkdir(uploadDir, { recursive: true });

  const mediaRecords = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${i}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
    const url = `/uploads/${postId}/${filename}`;

    const media = await prisma.media.create({
      data: {
        postId,
        url,
        type,
        filename: file.name,
        size: file.size,
        order: i,
      },
    });
    mediaRecords.push(media);
  }

  return NextResponse.json({ media: mediaRecords }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id: postId } = await params;
  const { mediaId } = await req.json();

  await prisma.media.delete({ where: { id: mediaId, postId } });
  return NextResponse.json({ success: true });
}
