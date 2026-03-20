import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  await transporter.sendMail({
    from: `"Seu Site" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Redefinição de senha",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e11d48;">Redefinir sua senha</h2>
        <p>Você solicitou a redefinição de senha. Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Redefinir Senha
        </a>
        <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
        <p style="color: #666; font-size: 14px;">Se você não solicitou a redefinição, ignore este email.</p>
      </div>
    `,
  });
}
