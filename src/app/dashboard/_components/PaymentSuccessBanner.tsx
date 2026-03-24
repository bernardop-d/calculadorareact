"use client";

import { useSearchParams } from "next/navigation";

export default function PaymentSuccessBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("payment") !== "success") return null;
  return (
    <div className="bg-[#F5C400]/10 border border-[#F5C400]/30 rounded-xl p-4 mb-6 text-[#F5C400] text-sm text-center">
      Pagamento confirmado! Seja bem-vindo ao conteúdo exclusivo.
    </div>
  );
}
