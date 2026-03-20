"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, LoginInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError("");
    try {
      await login(data.email, data.password);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro ao fazer login");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-zinc-400">Acesse sua conta para ver o conteúdo exclusivo</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Senha"
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            {serverError && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
                {serverError}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="text-rose-400 hover:text-rose-300 font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
