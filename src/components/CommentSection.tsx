"use client";

import { useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Send, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; avatarUrl: string | null };
}

interface Props {
  postId: string;
  currentUserId?: string;
  isAdmin?: boolean;
}

export default function CommentSection({ postId, currentUserId, isAdmin }: Props) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: loading,
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      fetch(`/api/posts/${postId}/comments${pageParam ? `?cursor=${pageParam}` : ""}`).then((r) => r.json()),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    staleTime: 0,
    gcTime: 0,
  });

  const comments = data?.pages.flatMap((p) => p.comments) ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (res.ok) {
        setBody("");
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
    } catch {
      // network error — keep body so user can retry
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    } catch {
      // silently ignore
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={16} className="text-zinc-500" />
        <h3 className="text-sm font-semibold text-zinc-300">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* Comment form */}
      {currentUserId && (
        <form onSubmit={submit} className="flex gap-2 mb-5">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            placeholder="Escreva um comentário..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 focus:border-[#F5C400]/40"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="w-10 h-10 bg-[#F5C400] rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#FFD700] transition-colors shrink-0"
          >
            <Send size={15} className="text-black" />
          </button>
        </form>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-white/3 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-6">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              <div className="w-8 h-8 bg-[#F5C400]/10 border border-[#F5C400]/20 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-[#F5C400]">
                {(c.user.name ?? "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-white">{c.user.name ?? "Usuário"}</span>
                  <span className="text-xs text-zinc-600">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-zinc-300 mt-0.5 break-words">{c.body}</p>
              </div>
              {(c.user.id === currentUserId || isAdmin) && (
                <button
                  type="button"
                  onClick={() => deleteComment(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}

          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              className="text-xs text-zinc-500 hover:text-[#F5C400] transition-colors mt-2"
            >
              Carregar mais comentários
            </button>
          )}
        </div>
      )}
    </div>
  );
}
