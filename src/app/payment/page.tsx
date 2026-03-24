"use client";

import { Suspense, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { Crown, Shield, Lock, Flame, Star } from "lucide-react";

function PaymentContent() {
  const { user, isSubscribed, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled");
  const [checkoutLoading, setCheckoutLoading] = useState<"basic" | "premium" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && isSubscribed) router.replace("/dashboard");
  }, [user, isSubscribed, loading, router]);

  async function handleCheckout(plan: "basic" | "premium") {
    setCheckoutLoading(plan);
    setError("");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Erro ao iniciar pagamento. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,196,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-2xl">
        {cancelled && (
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 mb-6 text-center">
            Pagamento cancelado. Tente novamente quando quiser.
          </div>
        )}

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#F5C400]/10 border-2 border-[#F5C400]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-gold">
            <Crown size={28} className="text-[#F5C400]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Escolha seu plano</h1>
          <p className="text-zinc-500 text-sm">
            Olá{user?.name ? `, ${user.name}` : ""}! Eu tô esperando você entrar.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Basic plan */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} className="text-zinc-400" />
              <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Básico</span>
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-zinc-400 text-sm mb-0.5">R$</span>
              <span className="text-4xl font-black text-white">19</span>
              <span className="text-zinc-400 text-lg mb-0.5">,90</span>
            </div>
            <p className="text-zinc-600 text-xs mb-5">por mês</p>
            <ul className="space-y-2 mb-6 flex-1">
              {[
                "Fotos HD exclusivas",
                "Conteúdo novo toda semana",
                "Cancele quando quiser",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center shrink-0 text-xs text-zinc-300">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleCheckout("basic")}
              loading={checkoutLoading === "basic"}
            >
              Assinar Básico
            </Button>
          </div>

          {/* Premium plan */}
          <div className="bg-white/[0.03] border border-[#F5C400]/30 rounded-2xl p-6 flex flex-col relative overflow-hidden glow-gold">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#F5C400]/60 to-transparent" />
            <div className="absolute top-3 right-3">
              <span className="bg-[#F5C400] text-black text-[10px] font-black px-2 py-0.5 rounded-full">POPULAR</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} className="text-[#F5C400]" />
              <span className="text-xs font-bold text-[#F5C400] tracking-widest uppercase">Premium</span>
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-zinc-400 text-sm mb-0.5">R$</span>
              <span className="text-4xl font-black text-white">39</span>
              <span className="text-zinc-400 text-lg mb-0.5">,90</span>
            </div>
            <p className="text-zinc-600 text-xs mb-5">por mês</p>
            <ul className="space-y-2 mb-6 flex-1">
              {[
                "Tudo do plano Básico",
                "Vídeos exclusivos HD",
                "Conteúdo sem censura",
                "Mensagem privada comigo",
                "Acesso antecipado",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="w-4 h-4 bg-[#F5C400]/15 border border-[#F5C400]/30 rounded-full flex items-center justify-center shrink-0 text-[10px] text-[#F5C400]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button
              className="w-full shadow-[0_0_30px_rgba(245,196,0,0.25)]"
              onClick={() => handleCheckout("premium")}
              loading={checkoutLoading === "premium"}
            >
              <Flame size={14} className="mr-2" />
              Assinar Premium
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-zinc-500" />
            Pagamento seguro
          </div>
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-zinc-500" />
            Discreta na fatura
          </div>
          <div className="flex items-center gap-1.5">
            <Crown size={12} className="text-zinc-500" />
            Cancele quando quiser
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
