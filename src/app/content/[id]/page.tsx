"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import NextImage from "next/image";
import { ArrowLeft, Image as ImageIcon, Play } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import ProtectedVideo from "@/components/ProtectedVideo";
import { useSecurityMonitor } from "@/hooks/useSecurityMonitor";

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
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Identificador do usuário para watermark
  const watermark = user?.email ?? user?.name ?? "Assinante";

  // Detecta e loga print screen, gravação de tela, devtools
  useSecurityMonitor({ postId: id });

  // Bloquear Ctrl+S, Ctrl+P e PrintScreen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "p", "u", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Bloquear clique direito em toda a página de conteúdo
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !user || !id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.locked) router.replace("/payment");
        else if (data.error) setError(data.error);
        else setPost(data.post);
      })
      .catch(() => setError("Erro ao carregar conteúdo"))
      .finally(() => setFetching(false));
  }, [id, user, loading, router]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  if (loading || fetching) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">{error || "Post não encontrado"}</p>
          <Link href="/dashboard" className="text-[#F5C400] text-sm mt-2 block">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const currentMedia = selectedMedia ?? post.media[0];

  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none"
      onContextMenu={handleContextMenu}
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2 select-none">{post.title}</h1>
      {post.description && (
        <p className="text-zinc-400 mb-2 select-none">{post.description}</p>
      )}
      <p className="text-zinc-600 text-sm mb-6 select-none">{formatDate(post.createdAt)}</p>

      {/* Main media viewer */}
      {currentMedia && (
        <div className="mb-4">
          {currentMedia.type === "VIDEO" ? (
            <ProtectedVideo src={currentMedia.url} watermark={watermark} />
          ) : (
            /* Protected image */
            <div
              className="relative bg-zinc-900 rounded-xl overflow-hidden"
              onContextMenu={handleContextMenu}
              onDragStart={(e) => e.preventDefault()}
            >
              <NextImage
                src={currentMedia.url}
                alt={post.title}
                fill
                sizes="100vw"
                unoptimized
                className="object-contain pointer-events-none select-none !max-h-[600px]"
                draggable={false}
              />

              {/* Transparent overlay — absorbs mouse events */}
              <div
                className="absolute inset-0"
                onContextMenu={handleContextMenu}
                onDragStart={(e) => e.preventDefault()}
              />

              {/* Tiled watermark */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`absolute text-white/[0.07] font-bold text-sm select-none whitespace-nowrap watermark-tile-${i}`}
                  >
                    {watermark}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thumbnails strip */}
      {post.media.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {post.media.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMedia(m)}
              onContextMenu={handleContextMenu}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                (selectedMedia ?? post.media[0])?.id === m.id
                  ? "border-[#F5C400]"
                  : "border-transparent"
              }`}
            >
              {m.type === "VIDEO" ? (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Play size={16} className="text-zinc-400" />
                </div>
              ) : (
                <NextImage
                  src={m.url}
                  alt=""
                  fill
                  sizes="128px"
                  unoptimized
                  className="object-cover pointer-events-none select-none"
                  draggable={false}
                />
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

      {/* Aviso de proteção */}
      <p className="text-center text-zinc-700 text-xs mt-8 select-none">
        Conteúdo protegido · Reprodução exclusiva para assinantes · Distribuição proibida
      </p>
    </div>
  );
}
