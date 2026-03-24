import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { GetObjectCommand } from "@aws-sdk/client-s3";

/**
 * Serve imagens com watermark forense INVISÍVEL único por usuário.
 *
 * Técnica: spread-spectrum watermarking
 * - Gera ruído pseudo-aleatório baseado no ID do usuário (mesmo seed = mesmo padrão)
 * - Modifica o canal azul de cada pixel em ±STRENGTH
 * - Imperceptível ao olho humano (~1.5% de variação)
 * - Sobrevive a screenshots JPEG de alta qualidade
 * - Para identificar um vazamento: correlacionar a imagem vazada com o padrão
 *   de cada usuário cadastrado — o maior match é o responsável
 *
 * Uso: GET /api/media/watermarked?key=posts/abc/img.jpg
 */

const STRENGTH = 4; // ±4 por pixel no canal azul (invisível, porém detectável)

/** Hash simples de string → número (djb2) */
function hashUserId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h) ^ id.charCodeAt(i);
    h = h >>> 0; // mantém 32 bits sem sinal
  }
  return h;
}

/** PRNG determinístico mulberry32 — mesmo seed = mesma sequência */
function makeRng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Busca o buffer da imagem (R2 ou local) */
async function fetchImageBuffer(key: string): Promise<Buffer | null> {
  // R2 configurado
  if (
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  ) {
    const { S3Client } = await import("@aws-sdk/client-s3");
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key });
    const res = await s3.send(cmd);
    const chunks: Uint8Array[] = [];
    for await (const chunk of res.Body as AsyncIterable<Uint8Array>) chunks.push(chunk);
    return Buffer.concat(chunks);
  }

  // Local (dev)
  const filePath = path.join(process.cwd(), "public", key);
  return readFile(filePath);
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const key = req.nextUrl.searchParams.get("key");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Parâmetro inválido" }, { status: 400 });
  }

  const original = await fetchImageBuffer(key).catch(() => null);
  if (!original) return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 });

  // Decodifica a imagem e obtém pixels brutos
  const { data: pixels, info } = await sharp(original)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rng = makeRng(hashUserId(user.id));
  const out = Buffer.from(pixels);

  // Insere o padrão único do usuário no canal azul (índice 2 de cada pixel RGBA/RGB)
  for (let i = 0; i < out.length; i += channels) {
    const blueIdx = i + 2;
    if (blueIdx < out.length) {
      const delta = rng() > 0.5 ? STRENGTH : -STRENGTH;
      out[blueIdx] = Math.max(0, Math.min(255, out[blueIdx] + delta));
    }
  }

  const watermarked = await sharp(out, { raw: { width, height, channels } })
    .jpeg({ quality: 93 })
    .toBuffer();

  return new Response(new Uint8Array(watermarked), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "X-Robots-Tag": "noindex",
      "Content-Disposition": "inline",
    },
  });
}
