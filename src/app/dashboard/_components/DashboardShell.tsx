"use client";

import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PaymentSuccessBanner from "./PaymentSuccessBanner";
import BottomNav from "./BottomNav";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <Suspense fallback={null}>
        <PaymentSuccessBanner />
      </Suspense>
      {children}
      <BottomNav unreadMessages={unreadMessages} />
    </div>
  );
}
