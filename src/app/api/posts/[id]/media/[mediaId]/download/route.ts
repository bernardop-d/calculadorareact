import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id: postId, mediaId } = await params;

  // Access check
  const isActive = isSubscriptionActive(user.subscription?.status);
  const hasPPV = await prisma.postPurchase.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });
  if (!isActive && hasPPV?.status !== "succeeded") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media || media.postId !== postId) {
    return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 });
  }

  // Only watermark images
  if (!media.type.startsWith("image/") && media.type !== "IMAGE") {
    const filePath = path.join(process.cwd(), "public", media.url);
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": media.type,
        "Content-Disposition": `inline; filename="${media.filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  const filePath = path.join(process.cwd(), "public", media.url);
  const fileBuffer = await readFile(filePath);

  const username = user.name ?? user.email;
  const watermarkSvg = Buffer.from(`
    <svg width="500" height="60" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="40" font-size="22" fill="rgba(255,255,255,0.35)"
        text-anchor="middle" font-family="Arial" font-weight="bold"
        transform="rotate(-20, 250, 30)">
        @${username} • Queen Rayalla
      </text>
    </svg>`);

  const watermarked = await sharp(fileBuffer)
    .composite([{ input: watermarkSvg, gravity: "center", tile: true }])
    .jpeg({ quality: 92 })
    .toBuffer();

  return new Response(new Uint8Array(watermarked), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `inline; filename="${media.filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Robots-Tag": "noindex",
    },
  });
}
