"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erro ao cadastrar");
      }

      router.push("/payment");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Criar conta</h1>
          <p className="text-zinc-400">Apenas para maiores de 18 anos</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nome completo"
              id="name"
              type="text"
              placeholder="Seu nome"
              error={errors.name?.message}
              {...register("name")}
            />

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
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label="Confirmar senha"
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Input
              label="Data de nascimento"
              id="birthDate"
              type="date"
              error={errors.birthDate?.message}
              {...register("birthDate")}
            />

            {/* Age confirmation */}
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="ageConfirmed"
                  className="mt-0.5 w-4 h-4 accent-rose-500"
                  {...register("ageConfirmed")}
                />
                <span className="text-sm text-zinc-300">
                  Confirmo que tenho{" "}
                  <strong className="text-white">18 anos ou mais</strong> e
                  concordo em acessar conteúdo adulto
                </span>
              </label>
              {errors.ageConfirmed && (
                <p className="text-sm text-red-400 mt-1">{errors.ageConfirmed.message}</p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
                {serverError}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-rose-400 hover:text-rose-300 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
