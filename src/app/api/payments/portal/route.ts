import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/utils";

export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Nenhuma assinatura encontrada" },
        { status: 404 }
      );
    }

    const session = await createPortalSession(
      dbUser.stripeCustomerId,
      `${getBaseUrl()}/dashboard`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[PORTAL]", error);
    return NextResponse.json({ error: "Erro ao abrir portal" }, { status: 500 });
  }
}
