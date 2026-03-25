"use client";

import { Eye, EyeOff, ImageIcon, Pencil, Trash2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  contentTier: string | null;
  published: boolean;
  _count: { media: number };
  media: { url: string; type: string }[];
}

interface Props {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}

const TIER_STYLES: Record<string, string> = {
  FREE:    "bg-green-500/20 text-green-400",
  BASIC:   "bg-blue-500/20 text-blue-400",
  PREMIUM: "bg-[#F5C400]/20 text-[#F5C400]",
};
const TIER_LABELS: Record<string, string> = {
  FREE: "Grátis", BASIC: "Básico", PREMIUM: "Premium",
};

export default function PostGridItem({ post, onEdit, onDelete }: Props) {
  const tier = post.contentTier ?? "PREMIUM";
  const media = post.media[0];

  return (
    <div className="relative aspect-square group overflow-hidden bg-zinc-900">
      {/* Thumbnail */}
      {media ? (
        media.type === "VIDEO" ? (
          <video src={media.url} className="w-full h-full object-cover" muted preload="metadata" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt="" className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon size={32} className="text-zinc-700" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-white text-sm font-semibold line-clamp-2 leading-tight">{post.title}</p>
          <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TIER_STYLES[tier]}`}>
            {TIER_LABELS[tier]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${
              post.published ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
            }`}>
              {post.published ? <Eye size={9} /> : <EyeOff size={9} />}
              {post.published ? "Publicado" : "Rascunho"}
            </span>
            <span className="text-zinc-500 text-[10px]">{post._count.media} mídia(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Editar post"
              onClick={() => onEdit(post)}
              className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <Pencil size={13} className="text-white" />
            </button>
            <button
              type="button"
              title="Excluir post"
              onClick={() => onDelete(post.id)}
              className="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 rounded-lg flex items-center justify-center transition-colors"
            >
              <Trash2 size={13} className="text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Badge rascunho sempre visível */}
      {!post.published && (
        <div className="absolute top-2 left-2 bg-black/60 rounded-md px-1.5 py-0.5 flex items-center gap-1">
          <EyeOff size={9} className="text-zinc-400" />
          <span className="text-[10px] text-zinc-400">Rascunho</span>
        </div>
      )}
      {post._count.media > 1 && (
        <div className="absolute top-2 right-2">
          <ImageIcon size={14} className="text-white drop-shadow" />
        </div>
      )}
    </div>
  );
}
