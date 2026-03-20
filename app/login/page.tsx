"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Crown, Lock, Eye, EyeOff, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, LoginInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex bg-[#080808]">

      {/* ── LEFT — Creator photo ── */}
      <div className="hidden lg:block lg:w-[58%] relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/creator.jpg"
          alt="Queen Rayalla"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />

        {/* Subtle vignette — keep photo visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-[#080808]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/10 to-black/25" />

        {/* Top-left brand */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 bg-[#F5C400]/15 border border-[#F5C400]/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Crown size={16} className="text-[#F5C400]" />
          </div>
          <span className="font-black text-lg drop-shadow-lg">
            <span className="text-white">Queen </span>
            <span className="text-[#F5C400]">Rayalla</span>
          </span>
        </div>

        {/* Bottom overlay card */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <p className="text-2xl font-black text-white leading-snug mb-1">
              Sentei esperando{" "}
              <span className="text-[#F5C400]">você voltar.</span>
            </p>
            <p className="text-zinc-400 text-sm mb-5">
              Entra logo que tem coisa nova guardada só pra você ver.
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "500+", label: "Fotos HD" },
                { value: "100+", label: "Vídeos" },
                { value: "Novo", label: "Toda semana" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-black text-[#F5C400]">{s.value}</div>
                  <div className="text-zinc-500 text-xs">{s.label}</div>
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

        {/* Decorative glow behind form */}
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
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black text-white mb-1.5">Voltou com saudade?</h1>
              <p className="text-zinc-500 text-sm">
                Eu sei que sim. Entra aqui que eu tô te esperando.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
              <Input
                id="email"
                type="email"
                placeholder="Seu e-mail"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />

              {/* Password with toggle */}
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  autoComplete="current-password"
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

              <div className="flex justify-end -mt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-600 hover:text-[#F5C400] transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {serverError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
                  {serverError}
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                <Lock size={15} className="mr-2" />
                Entrar
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-zinc-700 text-xs">não tem conta?</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Register CTA */}
            <Link href="/register">
              <Button variant="outline" className="w-full" size="lg">
                <Flame size={15} className="mr-2" />
                Criar conta grátis
              </Button>
            </Link>

            <p className="text-center text-xs text-zinc-700 mt-5">
              Ao entrar, você confirma que tem 18 anos ou mais
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
