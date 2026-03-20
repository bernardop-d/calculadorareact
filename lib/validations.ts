import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string(),
    birthDate: z.string().refine((val) => {
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
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
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
  published: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type PostInput = z.infer<typeof postSchema>;
