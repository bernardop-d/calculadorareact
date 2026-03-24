"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setServerError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setServerError(json.error || "Erro ao redefinir senha");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Nova senha</h1>
          <p className="text-zinc-400">Crie uma nova senha segura</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-semibold text-white mb-2">Senha alterada!</h2>
              <p className="text-zinc-400 text-sm">Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <input type="hidden" {...register("token")} />

              <Input
                label="Nova senha"
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Confirmar nova senha"
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              {serverError && (
                <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
                  {serverError}
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                Redefinir senha
              </Button>

              <p className="text-center text-sm">
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
