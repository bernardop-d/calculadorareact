"use client";

import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Crown, Flame } from "lucide-react";
import PaymentSuccessBanner from "./PaymentSuccessBanner";
import BottomNav from "./BottomNav";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isSubscribed, loading, logout } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["unread-count"],
    queryFn: () => fetch("/api/messages/unread-count").then((r) => r.json()),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
  });

  const unreadMessages = unreadData?.count ?? 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      <Suspense fallback={null}>
        <PaymentSuccessBanner />
      </Suspense>

      {!isSubscribed && (
        <div className="bg-white/3 border border-[#F5C400]/20 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F5C400]/10 rounded-xl flex items-center justify-center shrink-0">
              <Crown size={18} className="text-[#F5C400]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Desbloqueie todo o conteúdo</p>
              <p className="text-zinc-500 text-xs">Assine e veja tudo sem blur a partir de R$19,90/mês</p>
            </div>
          </div>
          <Link href="/payment">
            <Button size="sm" className="shrink-0">
              <Flame size={13} className="mr-1.5" />
              Assinar agora
            </Button>
          </Link>
        </div>
      )}

      {children}

      <BottomNav unreadMessages={unreadMessages} />
    </div>
  );
}
