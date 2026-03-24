"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import TipModal from "@/components/TipModal";
import { Crown, Heart, Image as ImageIcon, Users, Lock, Flame } from "lucide-react";

interface ProfileData {
  name: string;
  avatarUrl: string;
  bio: string;
  stats: { totalPosts: number; activeFans: number };
  recentPosts: { id: string; title: string; thumbnail: string | null; isPremium: boolean; likeCount: number }[];
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-600 text-sm">Erro ao carregar perfil.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Hero */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 sm:h-64 relative overflow-hidden">
          <Image src="/creator.jpg" alt="" fill sizes="100vw" className="object-cover object-top hero-bg-image scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#080808]" />
        </div>

        {/* Avatar + info */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative z-10">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#F5C400]/40 shrink-0">
              <Image src={data.avatarUrl} alt={data.name} fill sizes="96px" className="object-cover object-top" />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{data.name}</h1>
                <div className="w-5 h-5 bg-[#F5C400] rounded-full flex items-center justify-center">
                  <Crown size={10} className="text-black" />
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">{data.bio}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-5 mb-6">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={14} className="text-zinc-500" />
              <span className="text-white font-bold text-sm">{data.stats.totalPosts}</span>
              <span className="text-zinc-600 text-xs">posts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-zinc-500" />
              <span className="text-white font-bold text-sm">{data.stats.activeFans}+</span>
              <span className="text-zinc-600 text-xs">fãs ativos</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link href="/payment" className="flex-1">
              <Button size="lg" className="w-full shadow-[0_0_30px_rgba(245,196,0,0.2)]">
                <Flame size={15} className="mr-2" />
                Assinar e ver tudo
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setShowTip(true)}
            >
              <Heart size={15} className="mr-2" />
              Mandar um mimo
            </Button>
          </div>
        </div>
      </div>

      {/* Recent posts grid */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
          Conteúdo recente
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.recentPosts.map((post) => (
            <Link key={post.id} href={`/content/${post.id}`}>
              <div className="relative aspect-square rounded-xl overflow-hidden group bg-zinc-900">
                {post.thumbnail ? (
                  <>
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover clip-top-25"
                    />
                    <Image
                      src={post.thumbnail}
                      alt=""
                      aria-hidden
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover blur-2xl scale-110 brightness-50 clip-bottom-75"
                    />
                    <div className="absolute left-0 right-0 h-8 preview-fade" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-zinc-700" size={24} />
                  </div>
                )}

                {/* Lock overlay */}
                {post.isPremium && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <Lock size={20} className="text-[#F5C400]" />
                  </div>
                )}

                {/* Like count */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/80">
                  <Heart size={11} className="fill-red-400 text-red-400" />
                  {post.likeCount}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/register">
            <Button variant="outline">
              Ver todo o conteúdo
            </Button>
          </Link>
        </div>
      </div>

      {showTip && <TipModal onClose={() => setShowTip(false)} />}
    </div>
  );
}
