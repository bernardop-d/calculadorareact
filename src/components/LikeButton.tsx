"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface Props {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}

export default function LikeButton({ postId, initialCount, initialLiked, isAuthenticated }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isAuthenticated || loading) return;
    setLoading(true);
    // Optimistic update
    setLiked((v) => !v);
    setCount((v) => (liked ? v - 1 : v + 1));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.count);
      } else {
        // Revert on error
        setLiked((v) => !v);
        setCount((v) => (liked ? v + 1 : v - 1));
      }
    } catch {
      setLiked((v) => !v);
      setCount((v) => (liked ? v + 1 : v - 1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!isAuthenticated}
      className={`flex items-center gap-1 text-xs transition-all ${
        liked ? "text-red-400" : "text-zinc-500 hover:text-red-400"
      } disabled:cursor-default`}
      title={isAuthenticated ? (liked ? "Descurtir" : "Curtir") : "Faça login para curtir"}
    >
      <Heart
        size={13}
        className={`transition-transform ${liked ? "fill-red-400 scale-110" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}
