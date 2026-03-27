"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import CreatorHeader from "@/components/CreatorHeader";
import StoriesBar from "@/components/StoriesBar";
import PostsGrid from "@/components/PostsGrid";
import MediaGrid from "@/components/MediaGrid";
import { Grid2X2, LayoutList } from "lucide-react";

interface Profile {
  name: string;
  username: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  stats: { totalPosts: number; activeFans: number };
}

type Tab = "posts" | "media";

export default function DashboardContentPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("posts");

  const { data: profile } = useQuery<Profile>({
    queryKey: ["creator-profile-full"],
    queryFn: () => fetch("/api/profile").then((r) => r.json()),
    staleTime: 5 * 60_000,
    enabled: !!user,
  });

  if (loading || !user) return null;

  return (
    <div>
      {/* Profile header */}
      <CreatorHeader
        name={profile?.name ?? ""}
        username={profile?.username ?? ""}
        avatarUrl={profile?.avatarUrl ?? null}
        coverUrl={profile?.coverUrl ?? null}
        bio={profile?.bio ?? null}
        stats={profile?.stats ?? { totalPosts: 0, activeFans: 0 }}
      />

      {/* Stories */}
      <StoriesBar />

      {/* Tabs */}
      <div className="flex border-b border-white/8 sticky top-0 z-20 bg-[var(--background)]">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 ${
            tab === "posts"
              ? "border-white text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <LayoutList size={16} />
          <span>{profile?.stats?.totalPosts ?? 0} POSTAGENS</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("media")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 ${
            tab === "media"
              ? "border-white text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Grid2X2 size={16} />
          <span>MÍDIA</span>
        </button>
      </div>

      {/* Tab content */}
      {tab === "posts" ? (
        <div className="px-2 md:px-0 pt-4">
          <PostsGrid />
        </div>
      ) : (
        <MediaGrid />
      )}
    </div>
  );
}
