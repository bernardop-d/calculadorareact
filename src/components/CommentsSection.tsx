"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2, UserCircle2 } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import NextImage from "next/image";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; avatarUrl: string | null };
}

interface Props {
  postId: string;
  currentUserId?: string;
  compact?: boolean;
}

export default function CommentsSection({ postId, currentUserId, compact }: Props) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: comments = [], isLoading: loading } = useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () =>
      fetch(`/api/posts/${postId}/comments`)
        .then((r) => r.json())
        .then((d) => d.comments ?? []),
    staleTime: 0,
    gcTime: 0,
  });

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
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      }
    } catch {
      // network error — keep body so user can retry
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      }
    } catch {
      // silently ignore
    }
  }

  return (
    <div className={compact ? "border-t border-white/6 px-3 pt-3 pb-2" : "mt-8 border-t border-white/[0.06] pt-8"}>
      {!compact && (
        <h3 className="text-sm font-semibold text-zinc-300 mb-5">
          Comentários
          {comments.length > 0 && (
            <span className="ml-2 text-zinc-600 font-normal">({comments.length})</span>
          )}
        </h3>
      )}

      {/* Comment form */}
      {currentUserId && (
        <form onSubmit={submit} className={compact ? "flex gap-2 mb-3" : "flex gap-2 mb-6"}>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            placeholder="Escreva um comentário..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 focus:border-[#F5C400]/40 transition-colors"
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
            <div key={i} className="h-14 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-8">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              {/* Avatar */}
              <div className="shrink-0">
                {c.user.avatarUrl ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <NextImage
                      src={c.user.avatarUrl}
                      alt={c.user.name ?? "Usuário"}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                ) : c.user.name ? (
                  <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-zinc-300">
                    {c.user.name[0].toUpperCase()}
                  </div>
                ) : (
                  <UserCircle2 size={32} className="text-zinc-700" />
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-white">
                    {c.user.name ?? "Usuário"}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {formatRelativeDate(c.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 mt-0.5 break-words">{c.body}</p>
              </div>

              {/* Delete button (own comment) */}
              {c.user.id === currentUserId && (
                <button
                  type="button"
                  onClick={() => deleteComment(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all shrink-0 self-start mt-0.5"
                  title="Apagar comentário"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
