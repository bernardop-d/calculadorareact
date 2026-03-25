"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "../_components/BottomNav";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["unread-count"],
    queryFn: () => fetch("/api/messages/unread-count").then((r) => r.json()),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <div className="pb-16">
      {children}
      <BottomNav unreadMessages={unreadData?.count ?? 0} />
    </div>
  );
}
