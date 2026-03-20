"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, Play } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Media {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  filename: string;
}

interface Post {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  media: Media[];
}

export default function ContentPage() {
  const { user, isSubscribed, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && !isSubscribed) router.replace("/payment");
  }, [user, isSubscribed, loading, router]);

  useEffect(() => {
    if (!isSubscribed || !id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setPost(data.post);
      })
      .catch(() => setError("Erro ao carregar conteúdo"))
      .finally(() => setFetching(false));
  }, [id, isSubscribed]);

  if (loading || fetching) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">{error || "Post não encontrado"}</p>
          <Link href="/dashboard" className="text-rose-400 text-sm mt-2 block">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const currentMedia = selectedMedia ?? post.media[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">{post.title}</h1>
      {post.description && (
        <p className="text-zinc-400 mb-2">{post.description}</p>
      )}
      <p className="text-zinc-600 text-sm mb-6">{formatDate(post.createdAt)}</p>

      {/* Main media viewer */}
      {currentMedia && (
        <div className="bg-zinc-900 rounded-xl overflow-hidden mb-4">
          {currentMedia.type === "VIDEO" ? (
            <video
              src={currentMedia.url}
              controls
              className="w-full max-h-[600px] object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentMedia.url}
              alt={post.title}
              className="w-full max-h-[600px] object-contain"
            />
          )}
        </div>
      )}

      {/* Thumbnails */}
      {post.media.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {post.media.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMedia(m)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                (selectedMedia ?? post.media[0])?.id === m.id
                  ? "border-rose-500"
                  : "border-transparent"
              }`}
            >
              {m.type === "VIDEO" ? (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Play size={16} className="text-zinc-400" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {post.media.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <ImageIcon className="mx-auto mb-2" size={40} />
          Nenhuma mídia disponível.
        </div>
      )}
    </div>
  );
}
