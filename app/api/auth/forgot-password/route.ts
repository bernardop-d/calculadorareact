import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateResetToken, getBaseUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = generateResetToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
