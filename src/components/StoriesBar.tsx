"use client";

import { useState, useEffect } from "react";
import StoryViewer from "./StoryViewer";
import { Plus } from "lucide-react";

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  viewed: boolean;
}

export default function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/stories", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setStories(d.stories ?? []))
      .catch((e) => { if (e.name !== "AbortError") console.error(e); });
    return () => controller.abort();
  }, []);

  function markViewed(id: string) {
    setStories((prev) => prev.map((s) => s.id === id ? { ...s, viewed: true } : s));
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
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-2 border-[#080808]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.mediaUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
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
