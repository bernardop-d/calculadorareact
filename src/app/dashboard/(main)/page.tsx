"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import LikeButton from "@/components/LikeButton";
import StoriesBar from "@/components/StoriesBar";
import { Lock, Image as ImageIcon, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

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
  locked: boolean;
}

export default function DashboardContentPage() {
  const { user, loading } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      fetch(`/api/posts${pageParam ? `?cursor=${pageParam}` : ""}`).then((r) => r.json()),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    enabled: !!user && !loading,
    staleTime: 0,
    gcTime: 0,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

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

  if (loading || !user) return null;

  return (
    <div>
      <StoriesBar />

      {postsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/3 rounded-xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">Nenhum conteúdo publicado ainda. Volte em breve!</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group bg-white/3 border border-white/6 rounded-xl overflow-hidden hover:border-[#F5C400]/20 transition-all"
              >
                <Link href={post.locked ? "/payment" : `/content/${post.id}`}>
                  <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                    {post.thumbnail ? (
                      <>
                        {post.locked ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={post.thumbnail}
                              alt={post.title}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover clip-top-25"
                              unoptimized={post.thumbnail.startsWith("http")}
                            />
                            <Image
                              src={post.thumbnail}
                              alt=""
                              aria-hidden="true"
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover blur-xl scale-110 brightness-75 clip-bottom-75"
                              unoptimized={post.thumbnail.startsWith("http")}
                            />
                            <div className="absolute left-0 right-0 h-8 preview-fade" />
                          </div>
                        ) : (
                          <Image
                            src={post.thumbnail}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized={post.thumbnail.startsWith("http")}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-zinc-700" size={32} />
                      </div>
                    )}

                    {post.locked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 mt-6">
                        <div className="w-10 h-10 bg-black/70 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Lock size={16} className="text-[#F5C400]" />
                        </div>
                        {post.ppvPrice ? (
                          <span className="text-xs font-bold text-[#F5C400] bg-black/60 px-2.5 py-1 rounded-full">
                            R${(post.ppvPrice / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-white bg-black/50 px-2.5 py-1 rounded-full">
                            Assinar
                          </span>
                        )}
                      </div>
                    )}

                    <div className="absolute top-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5 text-xs text-zinc-300 flex items-center gap-1">
                      <ImageIcon size={9} />
                      {post.mediaCount}
                    </div>
                  </div>
                </Link>

                <div className="p-2.5">
                  <p className="text-white text-xs font-semibold truncate group-hover:text-[#F5C400] transition-colors mb-1.5">
                    {post.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-600 text-xs">{formatDate(post.createdAt)}</p>
                    <div className="flex items-center gap-2.5">
                      <LikeButton
                        postId={post.id}
                        initialCount={post.likeCount}
                        initialLiked={post.likedByMe}
                        isAuthenticated={!!user}
                      />
                      <Link
                        href={`/content/${post.id}`}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        <MessageCircle size={13} />
                        <span>{post.commentCount}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
            {isFetchingNextPage && (
              <div className="w-5 h-5 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
            )}
            {!hasNextPage && posts.length > 0 && <p className="text-zinc-700 text-xs">Você viu tudo.</p>}
          </div>
        </>
      )}
    </div>
  );
}
