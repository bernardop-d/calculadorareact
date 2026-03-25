"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Conversation {
  user: { id: string; name: string | null; email: string; avatarUrl: string | null };
  lastMessage: { body: string; createdAt: string };
  unreadCount: number;
}

export default function AdminMessagesPage() {
  const { user } = useAuth();

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["admin-messages"],
    queryFn: () => fetch("/api/admin/messages").then((r) => r.json()).then((d) => d.conversations ?? []),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle size={20} className="text-[#F5C400]" />
        <h1 className="text-xl font-black text-white">Mensagens</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse" />)}
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-16">Nenhuma mensagem ainda.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link key={conv.user.id} href={`/admin/messages/${conv.user.id}`}>
              <div className="flex items-center gap-3 bg-white/3 border border-white/6 hover:border-[#F5C400]/20 rounded-xl p-4 transition-all group">
                <div className="w-10 h-10 bg-[#F5C400]/10 border border-[#F5C400]/20 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-[#F5C400]">
                  {(conv.user.name ?? conv.user.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <p className="text-white font-semibold text-sm truncate">
                      {conv.user.name ?? conv.user.email}
                    </p>
                    <span className="text-zinc-600 text-xs shrink-0 ml-2">{formatDate(conv.lastMessage.createdAt)}</span>
                  </div>
                  <p className="text-zinc-500 text-xs truncate mt-0.5">{conv.lastMessage.body}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-[#F5C400] rounded-full text-black text-[10px] font-black flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
                <ArrowRight size={14} className="text-zinc-600 group-hover:text-[#F5C400] transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
