"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  viewed: boolean;
}

interface Props {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onView: (id: string) => void;
}

export default function StoryViewer({ stories, initialIndex, onClose, onView }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = stories[index];
  const duration = current?.mediaType === "VIDEO" ? 30000 : 5000;

  const next = useCallback(() => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
      setProgress(0);
      onView(stories[index + 1].id);
    } else {
      onClose();
    }
  }, [index, stories, onClose, onView]);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { next(); return 0; }
        return p + (100 / (duration / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [index, duration, next]);

  // Video playback — manual play() to avoid AbortError from autoPlay + fast navigation
  useEffect(() => {
    const video = videoRef.current;
    if (!video || current.mediaType !== "VIDEO") return;
    const playPromise = video.play();
    return () => {
      playPromise?.then(() => video.pause()).catch(() => {});
    };
  }, [index, current.mediaType]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft" && index > 0) { setIndex((i) => i - 1); setProgress(0); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, next, onClose]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: i === index ? `${progress}%` : i < index ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-8 right-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
      >
        <X size={16} />
      </button>

      {/* Media */}
      <div className="relative max-w-sm w-full h-[85vh]">
        {current.mediaType === "VIDEO" ? (
          <video
            ref={videoRef}
            key={current.id}
            src={current.mediaUrl}
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <Image
            src={current.mediaUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-contain"
          />
        )}

        {/* Caption */}
        {current.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-sm">{current.caption}</p>
          </div>
        )}

        {/* Nav areas */}
        <button
          type="button"
          className="absolute left-0 top-0 bottom-0 w-1/3"
          onClick={() => { if (index > 0) { setIndex((i) => i - 1); setProgress(0); } }}
        />
        <button
          type="button"
          className="absolute right-0 top-0 bottom-0 w-1/3"
          onClick={next}
        />
      </div>

      {/* Arrow buttons */}
      {index > 0 && (
        <button
          type="button"
          onClick={() => { setIndex((i) => i - 1); setProgress(0); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {index < stories.length - 1 && (
        <button
          type="button"
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
