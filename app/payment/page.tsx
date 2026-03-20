"use client";

import { Suspense, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { Shield, Lock, Star, Check } from "lucide-react";

function PaymentContent() {
  const { user, isSubscribed, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && isSubscribed) router.replace("/dashboard");
  }, [user, isSubscribed, loading, router]);

  async function handleCheckout() {
    setCheckoutLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Erro ao iniciar pagamento. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {cancelled && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 mb-6 text-center">
            Pagamento cancelado. Você pode tentar novamente quando quiser.
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-rose-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Desbloqueie o conteúdo
          </h1>
          <p className="text-zinc-400">
            Olá, {user?.name || "visitante"}! Assine para ter acesso a todo o conteúdo exclusivo.
          </p>
        </div>

        {/* Plan card */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-rose-800/40 rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-4xl font-bold text-white">R$ 29,90</div>
              <div className="text-zinc-400">por mês · cancele quando quiser</div>
            </div>
            <div className="bg-rose-600 text-xs font-bold px-3 py-1.5 rounded-full">
              MENSAL
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              "Acesso ilimitado a fotos e vídeos",
              "Conteúdo novo toda semana",
              "Qualidade HD",
              "Cancele a qualquer momento",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-zinc-300">
                <Check size={16} className="text-rose-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
              {error}
            </div>
          )}

          <Button
            onClick={handleCheckout}
            loading={checkoutLoading}
            size="lg"
            className="w-full"
          >
            Pagar com cartão
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-zinc-400" />
            Pagamento seguro
          </div>
          <div className="flex items-center gap-1.5">
            <Lock size={14} className="text-zinc-400" />
            Dados criptografados
          </div>
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-zinc-400" />
            Powered by Stripe
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
