"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { CreditCard, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
}

export default function DashboardPaymentsPage() {
  const { user, isSubscribed, loading } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["payments-history"],
    queryFn: () => fetch("/api/payments/history").then((r) => r.json()).then((d) => d.payments ?? []),
    enabled: !!user && !loading,
    staleTime: 0,
    gcTime: 0,
  });

  async function handlePortal() {
    setPortalLoading(true);
    const res = await fetch("/api/payments/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-zinc-300">Histórico de pagamentos</h2>
        {isSubscribed && (
          <Button variant="secondary" size="sm" onClick={handlePortal} loading={portalLoading}>
            <CreditCard size={13} className="mr-1.5" />
            Gerenciar assinatura
          </Button>
        )}
      </div>
      {payments.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-12">Nenhum pagamento encontrado.</p>
      ) : (
        payments.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-zinc-500" />
                <div>
                  <p className="text-sm text-white">{p.description || "Pagamento"}</p>
                  <p className="text-xs text-zinc-500">{formatDate(p.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {formatCurrency(p.amount, p.currency.toUpperCase())}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === "succeeded" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
                  }`}
                >
                  {p.status === "succeeded" ? "Aprovado" : "Falhou"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
