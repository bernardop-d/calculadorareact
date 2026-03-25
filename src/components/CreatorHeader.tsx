"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Share2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  name: string;
  username: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  stats: { totalPosts: number; activeFans: number };
}

export default function CreatorHeader({ name, username, avatarUrl, coverUrl, bio, stats }: Props) {
  const { isSubscribed } = useAuth();

  function share() {
    if (navigator.share) {
      navigator.share({ title: name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }

  return (
    <div className="w-full">
      {/* Cover */}
      <div className="relative w-full h-44 bg-zinc-900 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt="capa"
            fill
            className="object-cover object-top"
            unoptimized={coverUrl.startsWith("http")}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
        {/* Share button */}
        <button
          type="button"
          title="Compartilhar"
          onClick={share}
          className="absolute top-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Avatar + info */}
      <div className="px-4 pb-4">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-[var(--background)] overflow-hidden bg-zinc-800">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  unoptimized={avatarUrl.startsWith("http")}
                />
              ) : (
                <div className="w-full h-full bg-zinc-700" />
              )}
            </div>
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--background)] rounded-full" />
          </div>
        </div>

        {/* Name */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <h1 className="text-white font-bold text-lg leading-tight">{name}</h1>
          <BadgeCheck size={18} className="text-blue-400 shrink-0" />
        </div>
        <p className="text-zinc-500 text-sm mb-3">@{username}</p>

        {/* Bio */}
        {bio && (
          <p className="text-zinc-300 text-sm leading-relaxed mb-4 whitespace-pre-line">{bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-5 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">{stats.totalPosts}</span>
            <span className="text-zinc-500">postagens</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">{stats.activeFans}</span>
            <span className="text-zinc-500">fãs</span>
          </div>
        </div>

        {/* Subscribe CTA */}
        {!isSubscribed && (
          <Link href="/payment" className="block">
            <Button className="w-full py-3 text-base font-bold rounded-xl">
              ASSINAR
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
