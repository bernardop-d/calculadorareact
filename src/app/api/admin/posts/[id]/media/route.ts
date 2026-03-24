import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadToR2, deleteFromR2, isR2Configured } from "@/lib/storage";
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

  const mediaRecords = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

    let url: string;
    let storageKey: string | null = null;

    if (isR2Configured()) {
      // Upload para Cloudflare R2
      storageKey = await uploadToR2(buffer, file.name, file.type, `posts/${postId}`);
      url = storageKey; // Guardamos a key; a URL assinada é gerada na leitura
    } else {
      // Fallback: disco local (desenvolvimento)
      const uploadDir = path.join(process.cwd(), "public", "uploads", postId);
      await mkdir(uploadDir, { recursive: true });
      const ext = path.extname(file.name);
      const filename = `${Date.now()}-${i}${ext}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      url = `/uploads/${postId}/${filename}`;
    }

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

  const media = await prisma.media.findUnique({ where: { id: mediaId, postId } });

  if (media && isR2Configured() && !media.url.startsWith("/uploads/")) {
    await deleteFromR2(media.url).catch(() => {});
  }

  await prisma.media.delete({ where: { id: mediaId, postId } });
  return NextResponse.json({ success: true });
}
