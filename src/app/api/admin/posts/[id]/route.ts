import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postSchema } from "@/lib/validations";
import { sendNewPostNotification } from "@/lib/email";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { media: { orderBy: { order: "asc" } } },
    });

    if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const previous = await prisma.post.findUnique({ where: { id }, select: { published: true } });
    const isNewlyPublished = !previous?.published && parsed.data.published;

    const post = await prisma.post.update({ where: { id }, data: parsed.data });

    if (isNewlyPublished) {
      prisma.user
        .findMany({ where: { subscription: { status: "ACTIVE" } }, select: { email: true } })
        .then((users) => {
          const emails = users.map((u) => u.email);
          return sendNewPostNotification(emails, { title: post.title, id: post.id, thumbnail: null });
        })
        .catch((err) => console.error("[NOTIFY]", err));
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { id } = await params;
    const { published } = await req.json();
    if (typeof published !== "boolean") {
      return NextResponse.json({ error: "Campo inválido" }, { status: 400 });
    }

    const previous = await prisma.post.findUnique({ where: { id }, select: { published: true, title: true } });
    const isNewlyPublished = !previous?.published && published;

    const post = await prisma.post.update({ where: { id }, data: { published } });

    if (isNewlyPublished) {
      prisma.user
        .findMany({ where: { subscription: { status: "ACTIVE" } }, select: { email: true } })
        .then((users) => {
          const emails = users.map((u) => u.email);
          return sendNewPostNotification(emails, { title: post.title, id: post.id, thumbnail: null });
        })
        .catch((err) => console.error("[NOTIFY]", err));
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
