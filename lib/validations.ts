import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo")
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "Nome deve conter apenas letras"),
    email: z.string().trim().toLowerCase().email("Email inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string(),
    birthDate: z
      .string()
      .refine(
        (val) => val !== "" && !isNaN(new Date(val).getTime()),
        "Data de nascimento inválida"
      )
      .refine((val) => {
        const date = new Date(val);
        const age = Math.floor(
          (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        );
        return age >= 18;
      }, "Você deve ter 18 anos ou mais para se cadastrar"),
    ageConfirmed: z.literal(true, "Você deve confirmar que tem 18 anos ou mais"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const postSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  description: z.string().optional(),
  isPremium: z.boolean(),
  contentTier: z.enum(["FREE", "BASIC", "PREMIUM"]).default("PREMIUM"),
  ppvPrice: z.number().int().min(100).optional().nullable(),
  unlocksAfterDays: z.number().int().min(1).optional().nullable(),
  published: z.boolean(),
});

export const commentSchema = z.object({
  body: z.string().min(1, "Comentário não pode ser vazio").max(500, "Comentário muito longo"),
});

export const tipSchema = z.object({
  amount: z.number().int().min(500, "Valor mínimo: R$5,00"),
  message: z.string().max(200, "Mensagem muito longa").optional(),
});

export const messageSchema = z.object({
  body: z.string().min(1, "Mensagem não pode ser vazia").max(1000, "Mensagem muito longa"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type TipInput = z.infer<typeof tipSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
