"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSent(true);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Recuperar senha</h1>
          <p className="text-zinc-400">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-semibold text-white mb-2">Email enviado!</h2>
              <p className="text-zinc-400 text-sm">
                Se este email estiver cadastrado, você receberá um link para
                redefinir sua senha em breve.
              </p>
              <Link href="/login" className="block mt-6">
                <Button variant="outline" className="w-full">
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                Enviar link
              </Button>

              <p className="text-center text-sm text-zinc-400">
                <Link href="/login" className="text-rose-400 hover:text-rose-300">
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
