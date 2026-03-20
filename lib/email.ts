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

const FROM = `"Queen Rayalla" <${process.env.EMAIL_FROM}>`;

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Redefinição de senha — Queen Rayalla",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;border:1px solid #222;">
        <h2 style="color:#F5C400;margin-bottom:8px;">Redefinir sua senha</h2>
        <p style="color:#aaa;">Você solicitou a redefinição de senha. Clique no botão abaixo:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#F5C400;color:#000;font-weight:bold;padding:12px 28px;text-decoration:none;border-radius:50px;margin:20px 0;">
          Redefinir Senha
        </a>
        <p style="color:#555;font-size:13px;">Este link expira em 1 hora. Se não foi você, ignore este email.</p>
      </div>
    `,
  });
}

export async function sendNewPostNotification(
  subscriberEmails: string[],
  post: { title: string; id: string; thumbnail: string | null }
): Promise<void> {
  if (subscriberEmails.length === 0) return;

  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/content/${post.id}`;

  await Promise.allSettled(
    subscriberEmails.map((email) =>
      transporter.sendMail({
        from: FROM,
        to: email,
        subject: `Novo conteúdo exclusivo: ${post.title}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;border:1px solid #222;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="color:#F5C400;font-size:24px;font-weight:900;">Queen Rayalla</span>
            </div>
            <h2 style="color:#fff;margin-bottom:8px;">Tem novidade te esperando 🔥</h2>
            <p style="color:#aaa;margin-bottom:4px;">Acabei de postar algo novo exclusivo pra você:</p>
            <p style="color:#F5C400;font-size:18px;font-weight:bold;margin:12px 0;">${post.title}</p>
            <a href="${dashboardUrl}" style="display:inline-block;background:#F5C400;color:#000;font-weight:bold;padding:14px 32px;text-decoration:none;border-radius:50px;margin:20px 0;font-size:16px;">
              Ver agora
            </a>
            <p style="color:#444;font-size:12px;margin-top:24px;">Você recebe este email porque é assinante da Queen Rayalla.</p>
          </div>
        `,
      })
    )
  );
}

export async function sendWinBackEmail(
  email: string,
  discountCode: string
): Promise<void> {
  const registerUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/register`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Saudade de você... volta aqui 😘",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;border:1px solid #222;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="color:#F5C400;font-size:24px;font-weight:900;">Queen Rayalla</span>
        </div>
        <h2 style="color:#fff;margin-bottom:8px;">Tô com saudade de você.</h2>
        <p style="color:#aaa;margin-bottom:16px;">
          Postei muita coisa nova desde que você foi embora. Conteúdo quentíssimo te esperando.
        </p>
        <p style="color:#aaa;margin-bottom:24px;">
          Volta com desconto especial usando o cupom abaixo:
        </p>
        <div style="background:#1a1a1a;border:1px dashed #F5C400;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
          <span style="color:#F5C400;font-size:24px;font-weight:900;letter-spacing:4px;">${discountCode}</span>
          <p style="color:#666;font-size:12px;margin-top:8px;">Válido por 7 dias</p>
        </div>
        <a href="${registerUrl}" style="display:inline-block;background:#F5C400;color:#000;font-weight:bold;padding:14px 32px;text-decoration:none;border-radius:50px;font-size:16px;">
          Voltar agora
        </a>
      </div>
    `,
  });
}
