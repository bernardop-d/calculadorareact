"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import { Trash2, Upload, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  expiresAt: string;
  createdAt: string;
  _count: { views: number };
}

export default function AdminStoriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: stories = [], isLoading: loading } = useQuery<Story[]>({
    queryKey: ["admin-stories"],
    queryFn: () => fetch("/api/admin/stories").then((r) => r.json()).then((d) => d.stories ?? []),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
  });

  async function upload() {
    if (!file || uploading) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    if (caption) fd.append("caption", caption);
    const res = await fetch("/api/admin/stories", { method: "POST", body: fd });
    if (res.ok) { setFile(null); setCaption(""); queryClient.invalidateQueries({ queryKey: ["admin-stories"] }); }
    setUploading(false);
  }

  async function deleteStory(id: string) {
    if (!confirm("Apagar este story?")) return;
    await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-black text-white mb-6">Stories</h1>

      {/* Upload */}
      <div className="bg-white/3 border border-white/6 rounded-2xl p-5 mb-8">
        <h2 className="text-sm font-bold text-zinc-300 mb-4">Novo Story (expira em 24h)</h2>
        <div className="space-y-3">
          <label className="flex flex-col items-center gap-2 border-2 border-dashed border-white/10 hover:border-[#F5C400]/30 rounded-xl p-6 cursor-pointer transition-colors">
            <Upload size={20} className="text-zinc-600" />
            <span className="text-sm text-zinc-500">
              {file ? file.name : "Clique para selecionar foto ou vídeo"}
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <input
            type="text"
            placeholder="Legenda (opcional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={150}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40"
          />
          <Button onClick={upload} loading={uploading} disabled={!file}>
            <Upload size={14} className="mr-2" />
            Publicar story
          </Button>
        </div>
      </div>

      {/* Stories list */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-0.5">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-zinc-900 animate-pulse" />)}
        </div>
      ) : stories.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-12">Nenhum story ainda.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-0.5">
          {stories.map((story) => {
            const expired = isExpired(story.expiresAt);
            return (
              <div key={story.id} className={`relative aspect-square group overflow-hidden bg-zinc-900 ${expired ? "opacity-40" : ""}`}>
                {story.mediaType === "VIDEO" ? (
                  <video src={story.mediaUrl} className="w-full h-full object-cover" muted preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={story.mediaUrl} alt="" className="w-full h-full object-cover" />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-zinc-300 text-[10px]">
                      <Clock size={9} />
                      {expired ? "Expirado" : formatDate(story.expiresAt)}
                    </div>
                    <span className="text-zinc-400 text-[10px]">{story._count.views} views</span>
                  </div>
                  <div className="flex items-end justify-between gap-1">
                    {story.caption
                      ? <p className="text-white text-[11px] line-clamp-2 flex-1">{story.caption}</p>
                      : <span />}
                    <button
                      type="button"
                      onClick={() => deleteStory(story.id)}
                      title="Apagar story"
                      className="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 rounded-lg flex items-center justify-center transition-colors shrink-0"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Badge expirado sempre visível */}
                {expired && (
                  <div className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1.5 py-0.5">
                    <span className="text-[9px] text-zinc-400">Expirado</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
