"use client";

import { useState } from "react";
import { X, Heart, Loader2 } from "lucide-react";
import Button from "./ui/Button";

const PRESETS = [500, 1000, 2000, 5000]; // centavos

interface Props {
  onClose: () => void;
}

export default function TipModal({ onClose }: Props) {
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "processing" | "success" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");

  const finalAmount = amount ?? (custom ? Math.round(parseFloat(custom) * 100) : 0);

  async function submit() {
    if (finalAmount < 500) { setErrorMsg("Valor mínimo: R$5,00"); return; }
    setStep("processing");
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, message: message || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // In production, you'd use Stripe.js to confirm the payment intent
      // For now we show a success (Stripe test mode handles it)
      void data.clientSecret;
      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao processar");
      setStep("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <X size={18} />
        </button>

        {step === "success" ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-red-400 fill-red-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Obrigada!</h3>
            <p className="text-zinc-500 text-sm">Sua gorjeta foi enviada com sucesso.</p>
            <Button className="w-full mt-6" onClick={onClose}>Fechar</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              <Heart size={18} className="text-red-400" />
              <h3 className="text-white font-bold">Enviar gorjeta</h3>
            </div>

            <p className="text-zinc-500 text-sm mb-4">Quanto você quer mandar?</p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setAmount(p); setCustom(""); }}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${
                    amount === p && !custom
                      ? "bg-[#F5C400] text-black"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  R${p / 100}
                </button>
              ))}
            </div>

            <input
              type="number"
              min="5"
              step="1"
              placeholder="Outro valor (R$)"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setAmount(null); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 mb-3"
            />

            <textarea
              placeholder="Mensagem (opcional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 resize-none mb-4"
            />

            {(step === "error" || errorMsg) && (
              <p className="text-red-400 text-xs mb-3">{errorMsg}</p>
            )}

            <Button
              className="w-full"
              onClick={submit}
              disabled={finalAmount < 500}
              loading={step === "processing"}
            >
              {step === "processing" ? (
                <Loader2 size={15} className="animate-spin mr-2" />
              ) : (
                <Heart size={15} className="mr-2" />
              )}
              Enviar {finalAmount >= 500 ? `R$${(finalAmount / 100).toFixed(2)}` : ""}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
