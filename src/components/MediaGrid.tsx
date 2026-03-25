"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, ImageIcon, Film } from "lucide-react";

interface MediaItem {
  id: string;
  url: string | null;
  type: string;
  postId: string;
  mediaCount: number;
  locked: boolean;
}

type Filter = "ALL" | "IMAGE" | "VIDEO";

async function fetchMedia({ pageParam, type }: { pageParam: string | null; type: Filter }) {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);
  if (type !== "ALL") params.set("type", type);
  const res = await fetch(`/api/media?${params}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function MediaGrid() {
  const { user, loading } = useAuth();
  const [filter, setFilter] = useState<Filter>("ALL");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["media-grid", filter],
    queryFn: ({ pageParam }) => fetchMedia({ pageParam: pageParam as string | null, type: filter }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? null,
    enabled: !!user && !loading,
    staleTime: 60_000,
  });

  // Refetch when filter changes
  useEffect(() => { refetch(); }, [filter, refetch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items: MediaItem[] = data?.pages.flatMap((p) => p.media) ?? [];
  const imageCount = data?.pages[0] ? undefined : undefined; // counts come from API eventually

  const FILTERS: { label: string; value: Filter; icon: React.ReactNode }[] = [
    { label: "Tudo", value: "ALL", icon: null },
    { label: "Fotos", value: "IMAGE", icon: <ImageIcon size={13} /> },
    { label: "Vídeos", value: "VIDEO", icon: <Film size={13} /> },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-[#F5C400] text-black"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-zinc-600 text-sm">Nenhuma mídia ainda.</div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.locked ? "/payment" : `/content/${item.postId}`}
              className="relative aspect-square bg-zinc-900 overflow-hidden group block"
            >
              {item.url ? (
                item.type === "VIDEO" ? (
                  <video
                    src={item.url}
                    className={`w-full h-full object-cover ${item.locked ? "blur-sm brightness-50 scale-105" : ""}`}
                    muted
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    className={`object-cover ${item.locked ? "blur-sm brightness-50 scale-105" : ""}`}
                    unoptimized={item.url.startsWith("http")}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <Lock size={20} className="text-zinc-700" />
                </div>
              )}

              {/* Lock overlay */}
              {item.locked && (
                <div className="absolute inset-0 flex flex-col items-end justify-end p-2">
                  <div className="w-7 h-7 bg-black/70 rounded-full flex items-center justify-center">
                    <Lock size={13} className="text-[#F5C400]" />
                  </div>
                </div>
              )}

              {/* Media type badge */}
              {item.type === "VIDEO" && !item.locked && (
                <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                  <Film size={10} className="text-white" />
                </div>
              )}

              {/* Multiple media count */}
              {item.mediaCount > 1 && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                  <ImageIcon size={10} className="text-white" />
                  <span className="text-[10px] text-white">{item.mediaCount}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-2">
        {isFetchingNextPage && (
          <div className="w-5 h-5 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
        )}
        {!hasNextPage && items.length > 0 && (
          <p className="text-zinc-700 text-xs py-4">Você viu tudo.</p>
        )}
      </div>
    </div>
  );
}
