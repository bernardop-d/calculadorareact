"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Send, UserCircle2, MessageCircle } from "lucide-react";
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

const COMPACT_LIMIT = 5;

export default function CommentsSection({ postId, currentUserId, compact }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input when opened in compact mode
  useEffect(() => {
    if (compact) inputRef.current?.focus();
  }, [compact]);

  function updatePostCommentCount(id: string, delta: number) {
    queryClient.setQueriesData<{ pages: { posts: { id: string; commentCount: number }[] }[] }>(
      { queryKey: ["posts"] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((p) =>
              p.id === id ? { ...p, commentCount: p.commentCount + delta } : p
            ),
          })),
        };
      }
    );
  }

  const { data: comments = [], isLoading: loading } = useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () =>
      fetch(`/api/posts/${postId}/comments`)
        .then((r) => r.json())
        .then((d) => d.comments ?? []),
    staleTime: 0,
    gcTime: 0,
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      body: text,
      createdAt: new Date().toISOString(),
      user: { id: currentUserId ?? "", name: user?.name ?? null, avatarUrl: user?.avatarUrl ?? null },
    };
    queryClient.setQueryData<Comment[]>(["comments", postId], (prev = []) => [...prev, tempComment]);
    updatePostCommentCount(postId, 1);
    setBody("");
    // show all so the new comment is visible
    setShowAll(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      } else {
        queryClient.setQueryData<Comment[]>(["comments", postId], (prev = []) => prev.filter((c) => c.id !== tempId));
        updatePostCommentCount(postId, -1);
        setBody(text);
      }
    } catch {
      queryClient.setQueryData<Comment[]>(["comments", postId], (prev = []) => prev.filter((c) => c.id !== tempId));
      updatePostCommentCount(postId, -1);
      setBody(text);
    }
  }

  async function deleteComment(commentId: string) {
    const prev = queryClient.getQueryData<Comment[]>(["comments", postId]) ?? [];
    queryClient.setQueryData<Comment[]>(["comments", postId], prev.filter((c) => c.id !== commentId));
    updatePostCommentCount(postId, -1);

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) {
        queryClient.setQueryData<Comment[]>(["comments", postId], prev);
        updatePostCommentCount(postId, 1);
      }
    } catch {
      queryClient.setQueryData<Comment[]>(["comments", postId], prev);
      updatePostCommentCount(postId, 1);
    }
  }

  // Ctrl/Cmd+Enter to submit
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  const visibleComments = compact && !showAll ? comments.slice(-COMPACT_LIMIT) : comments;
  const hiddenCount = comments.length - COMPACT_LIMIT;

  return (
    <div className={compact ? "border-t border-white/6 px-3 pt-3 pb-3" : "mt-8 border-t border-white/[0.06] pt-8"}>
      {!compact && (
        <h3 className="text-sm font-semibold text-zinc-300 mb-5">
          Comentários
          {comments.length > 0 && (
            <span className="ml-2 text-zinc-600 font-normal">({comments.length})</span>
          )}
        </h3>
      )}

      {/* Input */}
      {currentUserId && (
        <form onSubmit={submit} className={compact ? "flex gap-2 mb-3 items-end" : "flex gap-3 mb-6 items-end"}>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              maxLength={500}
              placeholder="Escreva um comentário..."
              className="w-full resize-none bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 focus:border-[#F5C400]/40 transition-colors overflow-hidden leading-relaxed"
            />
            {body.length > 400 && (
              <span className="absolute bottom-2 right-3 text-[10px] text-zinc-600">
                {500 - body.length}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={!body.trim()}
            className="w-9 h-9 bg-[#F5C400] rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-[#FFD700] active:scale-95 transition-all shrink-0 mb-0.5"
          >
            <Send size={14} className="text-black" />
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(compact ? 2 : 3)].map((_, i) => (
            <div key={i} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <div className="h-2.5 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-5 text-zinc-700">
          <MessageCircle size={20} />
          <p className="text-xs">Nenhum comentário ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* "Ver mais" link when collapsed */}
          {compact && !showAll && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Ver {hiddenCount} comentário{hiddenCount > 1 ? "s" : ""} anterior{hiddenCount > 1 ? "es" : ""}
            </button>
          )}

          {visibleComments.map((c) => {
            const isTemp = c.id.startsWith("temp-");
            return (
              <div key={c.id} className={`flex gap-2.5 group transition-opacity ${isTemp ? "opacity-60" : "opacity-100"}`}>
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                  {c.user.avatarUrl ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden relative">
                      <NextImage src={c.user.avatarUrl} alt={c.user.name ?? ""} fill sizes="28px" className="object-cover" />
                    </div>
                  ) : c.user.name ? (
                    <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-300">
                      {c.user.name[0].toUpperCase()}
                    </div>
                  ) : (
                    <UserCircle2 size={28} className="text-zinc-700" />
                  )}
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <div className="inline-block bg-white/5 rounded-2xl rounded-tl-sm px-3 py-2 max-w-full">
                    <span className="text-[11px] font-semibold text-zinc-300 block leading-none mb-1">
                      {c.user.name ?? "Usuário"}
                    </span>
                    <p className="text-sm text-zinc-200 break-words leading-snug">{c.body}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 pl-1">
                    <span className="text-[10px] text-zinc-600">{formatRelativeDate(c.createdAt)}</span>
                    {c.user.id === currentUserId && !isTemp && (
                      <button
                        type="button"
                        onClick={() => deleteComment(c.id)}
                        className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Apagar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
