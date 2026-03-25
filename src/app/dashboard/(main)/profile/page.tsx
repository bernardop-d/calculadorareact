"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { CreditCard, Crown, MessageCircle, Heart } from "lucide-react";
import Link from "next/link";

export default function DashboardProfilePage() {
  const { user, isSubscribed, loading, logout } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  async function handlePortal() {
    setPortalLoading(true);
    const res = await fetch("/api/payments/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  }

  if (loading || !user) return null;

  return (
    <div className="max-w-sm space-y-4">
      <Card>
        <CardContent className="space-y-4 py-5">
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wider">Nome</p>
            <p className="text-white mt-1">{user.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wider">Email</p>
            <p className="text-white mt-1">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wider">Assinatura</p>
            <p className={`mt-1 font-semibold text-sm ${isSubscribed ? "text-[#F5C400]" : "text-zinc-500"}`}>
              {isSubscribed ? "Ativa" : "Inativa"}
            </p>
          </div>
        </CardContent>
      </Card>

      {isSubscribed && (
        <Button variant="secondary" className="w-full" onClick={handlePortal} loading={portalLoading}>
          <CreditCard size={14} className="mr-2" />
          Gerenciar assinatura
        </Button>
      )}
      {!isSubscribed && (
        <Link href="/payment">
          <Button className="w-full">
            <Crown size={14} className="mr-2" />
            Assinar agora
          </Button>
        </Link>
      )}
      <Link href="/dashboard/messages">
        <Button variant="secondary" className="w-full">
          <MessageCircle size={14} className="mr-2" />
          Mensagens
        </Button>
      </Link>
      <Link href="/profile">
        <Button variant="secondary" className="w-full">
          <Heart size={14} className="mr-2" />
          Perfil da Rayalla
        </Button>
      </Link>
      <Button type="button" variant="ghost" className="w-full text-zinc-500 hover:text-red-400" onClick={logout}>
        Sair da conta
      </Button>
    </div>
  );
}
