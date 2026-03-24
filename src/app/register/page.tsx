"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Eye, EyeOff, Flame, Lock } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  }

  return (
    <div className="min-h-screen flex bg-[#080808]">

      {/* ── LEFT — Creator photo ── */}
      <div className="hidden lg:block lg:w-[58%] relative overflow-hidden">
        <Image
          src="/creator.jpg"
          alt="Queen Rayalla"
          fill
          sizes="58vw"
          className="object-cover object-top"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-[#080808]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/10 to-black/25" />

        {/* Brand */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 bg-[#F5C400]/15 border border-[#F5C400]/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Crown size={16} className="text-[#F5C400]" />
          </div>
          <span className="font-black text-lg drop-shadow-lg">
            <span className="text-white">Queen </span>
            <span className="text-[#F5C400]">Rayalla</span>
          </span>
        </div>

        {/* Bottom card */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <p className="text-2xl font-black text-white leading-snug mb-1">
              Entra logo que eu{" "}
              <span className="text-[#F5C400]">tô te esperando.</span>
            </p>
            <p className="text-zinc-400 text-sm mb-5">
              Cria sua conta grátis e vê tudo que eu guardo só pra quem entra.
            </p>

            <div className="space-y-2.5">
              {[
                "500+ fotos sem roupa e sem vergonha",
                "100+ vídeos que eu fiz pensando em você",
                "Conteúdo novo toda semana sem falta",
                "Cancela quando quiser sem drama",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span className="w-4 h-4 bg-[#F5C400]/15 border border-[#F5C400]/30 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[#F5C400] text-[10px] font-bold">✓</span>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-zinc-700 text-xs mt-4 text-center">
            Conteúdo exclusivo para maiores de 18 anos
          </p>
        </div>
      </div>

      {/* ── RIGHT — Form ── */}
      <div className="flex-1 flex flex-col bg-[#080808] relative">

        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F5C400]/4 rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2.5 p-6 border-b border-white/5 relative z-10">
          <div className="w-8 h-8 bg-[#F5C400]/10 border border-[#F5C400]/30 rounded-lg flex items-center justify-center">
            <Crown size={14} className="text-[#F5C400]" />
          </div>
          <span className="font-black">
            <span className="text-white">Queen </span>
            <span className="text-[#F5C400]">Rayalla</span>
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 relative z-10">
          <div className="w-full max-w-[360px]">

            {/* Crown icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-[#F5C400]/10 border border-[#F5C400]/30 rounded-2xl flex items-center justify-center glow-gold">
                <Crown size={24} className="text-[#F5C400]" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-7 text-center">
              <h1 className="text-3xl font-black text-white mb-1.5">Vem ser meu fã</h1>
              <p className="text-zinc-500 text-sm">
                Cria sua conta e eu te mostro tudo que tenho guardado
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                maxLength={100}
                error={errors.name?.message}
                onKeyDown={(e) => {
                  if (/[0-9]/.test(e.key)) e.preventDefault();
                }}
                {...register("name")}
              />

              <Input
                id="email"
                type="email"
                placeholder="Seu e-mail"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirmar senha"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div>
                <p className="text-xs text-zinc-600 mb-1.5">Data de nascimento</p>
                <Input
                  id="birthDate"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  error={errors.birthDate?.message}
                  {...register("birthDate")}
                />
              </div>

              {/* Age checkbox */}
              <label className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 cursor-pointer hover:border-[#F5C400]/25 transition-colors">
                <input
                  type="checkbox"
                  id="ageConfirmed"
                  className="w-4 h-4 accent-[#F5C400] shrink-0"
                  {...register("ageConfirmed")}
                />
                <span className="text-sm text-zinc-400">
                  Confirmo que tenho <strong className="text-white">18 anos ou mais</strong>
                </span>
              </label>
              {errors.ageConfirmed && (
                <p className="text-xs text-red-400 -mt-1">{errors.ageConfirmed.message}</p>
              )}

              {serverError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
                  {serverError}
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                <Flame size={15} className="mr-2" />
                Criar conta grátis
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-zinc-700 text-xs">já tem conta?</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <Link href="/login">
              <Button variant="secondary" className="w-full" size="lg">
                <Lock size={15} className="mr-2" />
                Entrar
              </Button>
            </Link>

            <p className="text-center text-xs text-zinc-700 mt-5">
              Ao se cadastrar, você confirma que tem 18 anos ou mais
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
