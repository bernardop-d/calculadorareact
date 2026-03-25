"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface AdminComment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  post: { id: string; title: string };
}

export default function AdminCommentsPage() {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading: loading } = useQuery<AdminComment[]>({
    queryKey: ["admin-comments"],
    queryFn: () =>
      fetch("/api/admin/comments")
        .then((r) => r.json())
        .then((d) => d.comments ?? []),
    staleTime: 0,
    gcTime: 0,
  });

  async function deleteComment(commentId: string) {
    if (!confirm("Apagar este comentário?")) return;
    try {
      const res = await fetch("/api/admin/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentId }),
      });
      if (res.ok) queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    } catch {
      // silently ignore
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-black text-white mb-6">Comentários</h1>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-16">
          Nenhum comentário ainda.
        </p>
      ) : (
        <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {comments.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Post info */}
                <div className="w-40 shrink-0">
                  <Link
                    href={`/content/${c.post.id}`}
                    className="text-xs text-[#F5C400] hover:underline font-medium line-clamp-2 leading-tight"
                  >
                    {c.post.title}
                  </Link>
                </div>

                {/* User info */}
                <div className="w-40 shrink-0">
                  <p className="text-xs font-semibold text-zinc-300 truncate">
                    {c.user.name ?? "—"}
                  </p>
                  <p className="text-xs text-zinc-600 truncate">{c.user.email}</p>
                </div>

                {/* Comment body */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 break-words line-clamp-2">
                    {c.body.length > 100 ? `${c.body.slice(0, 100)}…` : c.body}
                  </p>
                </div>

                {/* Date */}
                <div className="shrink-0 text-xs text-zinc-600 whitespace-nowrap">
                  {formatRelativeDate(c.createdAt)}
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => deleteComment(c.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                  title="Apagar comentário"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
