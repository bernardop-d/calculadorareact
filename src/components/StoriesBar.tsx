"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import StoryViewer from "./StoryViewer";

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  viewed: boolean;
}

async function fetchStories(): Promise<Story[]> {
  const res = await fetch("/api/stories");
  if (!res.ok) throw new Error("Failed to fetch stories");
  const data = await res.json();
  return data.stories ?? [];
}

export default function StoriesBar() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: fetchStories,
    staleTime: 0,
    gcTime: 0,
  });

  function markViewed(id: string) {
    queryClient.setQueryData<Story[]>(["stories"], (prev) =>
      prev?.map((s) => (s.id === id ? { ...s, viewed: true } : s))
    );
    fetch(`/api/stories/${id}/view`, { method: "POST" }).catch(() => {});
  }

  if (stories.length === 0) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {stories.map((story, i) => (
          <button
            key={story.id}
            type="button"
            onClick={() => { setActiveIndex(i); markViewed(story.id); }}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className={`w-16 h-16 rounded-full p-0.5 ${story.viewed ? "bg-zinc-700" : "bg-gradient-to-tr from-[#F5C400] to-[#FF6B6B]"}`}>
              <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-900 border-2 border-[#080808]">
                {story.mediaType === "VIDEO" ? (
                  <video
                    src={story.mediaUrl}
                    preload="metadata"
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={story.mediaUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            <span className={`text-[10px] max-w-[64px] truncate ${story.viewed ? "text-zinc-600" : "text-zinc-400"}`}>
              Story
            </span>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onView={markViewed}
        />
      )}
    </>
  );
}
