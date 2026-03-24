import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storage, isRemoteStorage } from "@/lib/storage";

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
    const buffer = Buffer.from(await file.arrayBuffer());
    const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

    // storage.upload returns a key (R2) or a /uploads/... path (local)
    const key = await storage.upload(buffer, file.name, file.type, `posts/${postId}`);

    const media = await prisma.media.create({
      data: {
        postId,
        url: key,
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

  if (media && isRemoteStorage()) {
    await storage.delete(media.url).catch(() => {});
  }

  await prisma.media.delete({ where: { id: mediaId, postId } });
  return NextResponse.json({ success: true });
}
