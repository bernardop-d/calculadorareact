"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface CreatorLink {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
  order: number;
}

interface Profile {
  name: string;
  avatarUrl: string;
  bio: string;
}

export default function LinksPage() {
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/links").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([linksData, profileData]) => {
      setLinks(linksData.links ?? []);
      setProfile(profileData);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Profile */}
        <div className="flex flex-col items-center mb-10">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#F5C400]/40 mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#F5C400]/10 border-2 border-[#F5C400]/30 flex items-center justify-center mb-4">
              <span className="text-3xl text-[#F5C400]">Q</span>
            </div>
          )}
          <h1 className="text-xl font-bold text-white mb-1">
            {loading ? "..." : profile?.name ?? "Queen Rayalla"}
          </h1>
          {profile?.bio && (
            <p className="text-sm text-zinc-400 text-center leading-relaxed max-w-xs">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-zinc-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <p className="text-center text-zinc-600 text-sm">Nenhum link disponível.</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full px-5 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-2xl transition-all duration-150"
              >
                <span className="flex items-center gap-3 text-white font-medium text-sm">
                  {link.emoji && <span className="text-xl">{link.emoji}</span>}
                  {link.title}
                </span>
                <ExternalLink size={14} className="text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
