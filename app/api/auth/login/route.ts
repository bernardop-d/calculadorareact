import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePasswords, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { allowed } = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 15 minutos." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        subscription: { select: { status: true } },
      },
    });

    if (!user || !(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionStatus: user.subscription?.status ?? null,
      },
    });
  } catch (error) {
    console.error("[LOGIN]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
