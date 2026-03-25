"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";
import { Lock, MessageCircle, Play, Pause, Maximize2, RotateCcw, RotateCw, Volume2, VolumeX, MoreHorizontal, BadgeCheck, DollarSign } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

function InlineVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Sync state with native video events (fullscreen controls change play/mute natively)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolumeChange = () => setMuted(v.muted);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("volumechange", onVolumeChange);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  }

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }

  function fullscreen() {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  }

  return (
    <div
      className="relative w-full bg-zinc-900 cursor-pointer"
      onClick={() => { if (!document.fullscreenElement) toggle(); }}
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        muted
        playsInline
        loop
        controlsList="nodownload"
        disablePictureInPicture
        className="w-full object-cover"
      />

      {/* Center controls: -10s | play/pause | +10s */}
      <div
        className={`absolute inset-0 flex items-center justify-center gap-5 transition-opacity ${playing ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}
          className="flex flex-col items-center gap-0.5 text-white drop-shadow"
        >
          <RotateCcw size={22} />
          <span className="text-[10px]">10s</span>
        </button>
        <button
          type="button"
          onClick={toggle}
          className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm"
        >
          {playing
            ? <Pause size={22} className="text-white fill-white" />
            : <Play size={22} className="text-white fill-white ml-1" />
          }
        </button>
        <button
          type="button"
          onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
          className="flex flex-col items-center gap-0.5 text-white drop-shadow"
        >
          <RotateCw size={22} />
          <span className="text-[10px]">10s</span>
        </button>
      </div>

      {/* Bottom-right controls: volume | fullscreen */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={toggleMute}
          className="w-8 h-8 bg-black/60 rounded-md flex items-center justify-center backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button
          type="button"
          onClick={fullscreen}
          className="w-8 h-8 bg-black/60 rounded-md flex items-center justify-center backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}

interface Post {
  id: string;
  title: string;
  description: string | null;
  isPremium: boolean;
  contentTier: string;
  ppvPrice: number | null;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  createdAt: string;
  mediaCount: number;
  thumbnail: string | null;
  firstMediaType: string | null;
  locked: boolean;
}

interface Creator {
  name: string;
  username: string;
  avatarUrl: string;
}

async function fetchPosts({ pageParam }: { pageParam: string | null }) {
  const res = await fetch(`/api/posts${pageParam ? `?cursor=${pageParam}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

async function fetchCreator(): Promise<Creator> {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export default function PostsGrid() {
  const { user, loading } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());

  function toggleComments(postId: string) {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  const { data: creator } = useQuery({
    queryKey: ["creator-profile-full"],
    queryFn: fetchCreator,
    staleTime: 10 * 60_000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    enabled: !!user && !loading,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const posts: Post[] = data?.pages.flatMap((p) => p.posts) ?? [];

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-white/6 pb-4 mb-4">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="aspect-[4/3] bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-600">
        Nenhum conteúdo publicado ainda. Volte em breve!
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {posts.map((post) => (
          <article key={post.id} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden mb-4">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                  {creator?.avatarUrl && (
                    <Image
                      src={creator.avatarUrl}
                      alt={creator.name ?? ""}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                      unoptimized={creator.avatarUrl.startsWith("http")}
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-white leading-none">
                      {creator?.name ?? ""}
                    </span>
                    <BadgeCheck size={15} className="text-blue-400 fill-blue-400/20" />
                  </div>
                  <span className="text-xs text-zinc-500 mt-0.5 block">
                    @{creator?.username ?? ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{formatRelativeDate(post.createdAt)}</span>
              </div>
            </div>

            {/* Caption */}
            {(post.description || post.title) && (
              <p className="px-3 text-zinc-200 mb-3 leading-relaxed">
                {post.description ?? post.title}
              </p>
            )}

            {/* Media */}
            {post.firstMediaType === "VIDEO" && !post.locked && post.thumbnail ? (
              <InlineVideo src={post.thumbnail} />
            ) : (
              <Link href={post.locked ? "/payment" : `/content/${post.id}`}>
                <div className="relative w-full bg-zinc-900 overflow-hidden">
                  {post.thumbnail ? (
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      width={800}
                      height={600}
                      className={`w-full object-cover ${post.locked ? "blur-sm brightness-50 scale-105" : ""}`}
                      unoptimized={post.thumbnail.startsWith("http")}
                    />
                  ) : (
                    <div className="aspect-video flex items-center justify-center">
                      <span className="text-zinc-700 text-sm">Sem mídia</span>
                    </div>
                  )}

                  {/* Lock overlay */}
                  {post.locked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-black/80 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Lock size={18} className="text-[#F5C400]" />
                      </div>
                      {post.ppvPrice ? (
                        <span className="text-sm font-bold text-[#F5C400] bg-black/70 px-3 py-1.5 rounded-full">
                          Desbloquear por R${(post.ppvPrice / 100).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-white bg-black/60 px-3 py-1.5 rounded-full">
                          Assinar para ver
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* Action bar */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-4">
                <LikeButton
                  postId={post.id}
                  initialCount={post.likeCount}
                  initialLiked={post.likedByMe}
                  isAuthenticated={!!user}
                />
                <button
                  type="button"
                  onClick={() => toggleComments(post.id)}
                  className={`flex cursor-pointer items-center gap-1.5 text-sm transition-colors ${openComments.has(post.id) ? "text-[#F5C400]" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <MessageCircle size={18} />
                  <span>{post.commentCount}</span>
                </button>
                <Link
                  href="/payment"
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#F5C400] transition-colors"
                >
                  <DollarSign size={18} />
                </Link>
              </div>
            </div>

            {/* Inline comments */}
            {openComments.has(post.id) && (
              <CommentsSection postId={post.id} currentUserId={user?.id} compact />
            )}
          </article>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-2">
        {isFetchingNextPage && (
          <div className="w-5 h-5 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-zinc-700 text-xs">Você viu tudo.</p>
        )}
      </div>
    </>
  );
}
