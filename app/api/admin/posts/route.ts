import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postSchema } from "@/lib/validations";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        media: { take: 1, orderBy: { order: "asc" } },
        _count: { select: { media: true } },
      },
    }),
    prisma.post.count(),
  ]);

  return NextResponse.json({ posts, total });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({ data: parsed.data });
  return NextResponse.json({ post }, { status: 201 });
}
