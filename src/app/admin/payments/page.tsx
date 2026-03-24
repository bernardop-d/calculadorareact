"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
  user: { email: string; name: string | null };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Pagamentos</h1>
        <p className="text-zinc-400 text-sm">{total} transações</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <p className="text-zinc-500 text-center py-20">Nenhum pagamento registrado.</p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white text-sm font-medium">
                    {p.user.name || p.user.email}
                  </p>
                  <p className="text-zinc-500 text-xs">{p.user.email}</p>
                  <p className="text-zinc-600 text-xs">{formatDate(p.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm">
                    {formatCurrency(p.amount, p.currency.toUpperCase())}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "succeeded"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-red-900/50 text-red-400"
                    }`}
                  >
                    {p.status === "succeeded" ? "Aprovado" : "Falhou"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
