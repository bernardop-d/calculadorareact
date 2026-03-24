"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  const [stories, setStories] = useState<Story[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStories = () => {
    fetch("/api/admin/stories")
      .then((r) => r.json())
      .then((d) => { setStories(d.stories ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { if (user) fetchStories(); }, [user]);

  async function upload() {
    if (!file || uploading) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    if (caption) fd.append("caption", caption);
    const res = await fetch("/api/admin/stories", { method: "POST", body: fd });
    if (res.ok) { setFile(null); setCaption(""); fetchStories(); }
    setUploading(false);
  }

  async function deleteStory(id: string) {
    if (!confirm("Apagar este story?")) return;
    await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
    fetchStories();
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-black text-white mb-6">Stories</h1>

      {/* Upload */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-8">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-white/[0.03] rounded-xl animate-pulse" />)}
        </div>
      ) : stories.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-12">Nenhum story ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {stories.map((story) => {
            const expired = isExpired(story.expiresAt);
            return (
              <div key={story.id} className={`relative rounded-xl overflow-hidden bg-zinc-900 ${expired ? "opacity-40" : ""}`}>
                <div className="relative aspect-square">
                  {story.mediaType === "VIDEO" ? (
                    <video src={story.mediaUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <Image src={story.mediaUrl} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-zinc-400 text-xs">
                      <Clock size={10} />
                      {expired ? "Expirado" : formatDate(story.expiresAt)}
                    </div>
                    <span className="text-zinc-500 text-xs">{story._count.views} views</span>
                  </div>
                  {story.caption && <p className="text-white text-xs mt-0.5 truncate">{story.caption}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => deleteStory(story.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
