"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import StoryGridItem from "@/components/admin/StoryGridItem";
import { Upload } from "lucide-react";

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
          {stories.map((story) => (
            <StoryGridItem key={story.id} story={story} onDelete={deleteStory} />
          ))}
        </div>
      )}
    </div>
  );
}
