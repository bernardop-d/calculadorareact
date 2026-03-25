"use client";

import { Clock, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  expiresAt: string;
  _count: { views: number };
}

interface Props {
  story: Story;
  onDelete: (id: string) => void;
}

export default function StoryGridItem({ story, onDelete }: Props) {
  const expired = new Date(story.expiresAt) < new Date();

  return (
    <div className={`relative aspect-square group overflow-hidden bg-zinc-900 ${expired ? "opacity-40" : ""}`}>
      {/* Thumbnail */}
      {story.mediaType === "VIDEO" ? (
        <video src={story.mediaUrl} className="w-full h-full object-cover" muted preload="metadata" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={story.mediaUrl} alt="" className="w-full h-full object-cover" />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-zinc-300 text-[10px]">
            <Clock size={9} />
            {expired ? "Expirado" : formatDate(story.expiresAt)}
          </div>
          <span className="text-zinc-400 text-[10px]">{story._count.views} views</span>
        </div>
        <div className="flex items-end justify-between gap-1">
          {story.caption
            ? <p className="text-white text-[11px] line-clamp-2 flex-1">{story.caption}</p>
            : <span />}
          <button
            type="button"
            title="Apagar story"
            onClick={() => onDelete(story.id)}
            className="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 rounded-lg flex items-center justify-center transition-colors shrink-0"
          >
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Badge expirado sempre visível */}
      {expired && (
        <div className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1.5 py-0.5">
          <span className="text-[9px] text-zinc-400">Expirado</span>
        </div>
      )}
    </div>
  );
}
