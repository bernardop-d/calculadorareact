"use client";

import { X, Crown, Lock, Globe, User } from "lucide-react";

interface MediaItem {
  url: string;
  type: string;
}

interface PostPreviewProps {
  title: string;
  description?: string;
  contentTier: string;
  media?: MediaItem[];
  onClose: () => void;
}

const TIER_LABELS: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  FREE: { label: "Grátis", color: "bg-green-500/20 text-green-400 border border-green-500/30", Icon: Globe },
  BASIC: { label: "Básico", color: "bg-blue-500/20 text-blue-400 border border-blue-500/30", Icon: Lock },
  PREMIUM: { label: "Premium", color: "bg-[#F5C400]/20 text-[#F5C400] border border-[#F5C400]/30", Icon: Crown },
};

export default function PostPreview({ title, description, contentTier, media = [], onClose }: PostPreviewProps) {
  const tier = TIER_LABELS[contentTier] ?? TIER_LABELS.PREMIUM;
  const TierIcon = tier.Icon;
  const images = media.filter((m) => m.type?.startsWith("image") || m.url);
  const [first, ...rest] = images;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-[#0e0e0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <User size={13} />
            <span>Preview — como assinante vê</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[80vh]">
          {/* Media */}
          {first && (
            <div className="relative aspect-video bg-zinc-900">
              {first.type?.startsWith("video") ? (
                <video
                  src={first.url}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={first.url} alt={title} className="w-full h-full object-cover" />
              )}
            </div>
          )}

          {/* Rest of media grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-3 gap-0.5 bg-zinc-950">
              {rest.map((m, i) => (
                <div key={i} className="aspect-square bg-zinc-900 overflow-hidden">
                  {m.type?.startsWith("video") ? (
                    <video src={m.url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Tier badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tier.color}`}>
              <TierIcon size={11} />
              {tier.label}
            </span>

            <h2 className="text-white font-bold text-lg leading-snug">{title || "Sem título"}</h2>

            {description && (
              <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
            )}

            {/* Mock user interaction */}
            <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/50 mt-2">
              <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                <span>♥</span>
                <span>0</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                <span>💬</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
