import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postSchema } from "@/lib/validations";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { media: { orderBy: { order: "asc" } } },
  });

  if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const post = await prisma.post.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ post });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
