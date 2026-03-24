"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, ArrowLeft,
  ImageIcon, Lock, Globe, Crown, Upload, X, FileVideo, Image as ImgIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema } from "@/lib/validations";

interface PostFormData {
  title: string;
  description?: string;
  isPremium: boolean;
  published: boolean;
  contentTier: "FREE" | "BASIC" | "PREMIUM";
  ppvPrice?: number | null;
  unlocksAfterDays?: number | null;
}

interface Post {
  id: string;
  title: string;
  description: string | null;
  isPremium: boolean;
  published: boolean;
  contentTier: string | null;
  ppvPrice: number | null;
  unlocksAfterDays: number | null;
  createdAt: string;
  _count: { media: number };
  media: { url: string; type: string }[];
}

type Mode = "list" | "create" | "edit";

const TIERS = [
  {
    value: "FREE",
    label: "Grátis",
    desc: "Qualquer pessoa pode ver",
    icon: Globe,
    color: "border-green-500/50 bg-green-500/10 text-green-400",
    check: "ring-green-500",
  },
  {
    value: "BASIC",
    label: "Básico",
    desc: "Requer assinatura básica",
    icon: Lock,
    color: "border-blue-500/50 bg-blue-500/10 text-blue-400",
    check: "ring-blue-500",
  },
  {
    value: "PREMIUM",
    label: "Premium",
    desc: "Requer assinatura premium",
    icon: Crown,
    color: "border-[#F5C400]/50 bg-[#F5C400]/10 text-[#F5C400]",
    check: "ring-[#F5C400]",
  },
] as const;

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<PostFormData>({ resolver: zodResolver(postSchema) as any });

  const published = watch("published");
  const contentTier = watch("contentTier");

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function startCreate() {
    setEditingPost(null);
    setUploadFiles([]);
    reset({ title: "", description: "", isPremium: true, published: false, contentTier: "PREMIUM", ppvPrice: null, unlocksAfterDays: null });
    setMode("create");
  }

  function startEdit(post: Post) {
    setEditingPost(post);
    setUploadFiles([]);
    reset({
      title: post.title,
      description: post.description ?? "",
      isPremium: post.isPremium,
      published: post.published,
      contentTier: (post.contentTier as "FREE" | "BASIC" | "PREMIUM") ?? "PREMIUM",
      ppvPrice: post.ppvPrice,
      unlocksAfterDays: post.unlocksAfterDays,
    });
    setMode("edit");
  }

  async function onSubmit(data: PostFormData) {
    setSaving(true);
    try {
      data.isPremium = data.contentTier !== "FREE";
      if (mode === "create") {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const created = await res.json();
        if (uploadFiles.length > 0 && created.post) {
          await uploadMedia(created.post.id, uploadFiles);
        }
      } else if (editingPost) {
        await fetch(`/api/admin/posts/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (uploadFiles.length > 0) {
          await uploadMedia(editingPost.id, uploadFiles);
        }
      }
      await fetchPosts();
      setMode("list");
      setUploadFiles([]);
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(postId: string, files: File[]) {
    setUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    await fetch(`/api/admin/posts/${postId}/media`, { method: "POST", body: formData });
    setUploading(false);
  }

  async function deletePost(id: string) {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setUploadFiles((prev) => [...prev, ...Array.from(fileList)]);
  }

  function removeFile(index: number) {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  }

  /* ── FORM ── */
  if (mode !== "list") {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setMode("list")}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Voltar para posts
        </button>

        <h1 className="text-2xl font-bold text-white mb-8">
          {mode === "create" ? "Criar novo post" : "Editar post"}
        </h1>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={(handleSubmit as any)(onSubmit)} className="space-y-6">

          {/* Título */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-200">Título *</label>
            <input
              placeholder="Ex: Ensaio especial de domingo"
              className={`w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 transition ${
                errors.title ? "border-red-500" : "border-zinc-700"
              }`}
              {...register("title")}
            />
            {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-zinc-200">
              Descrição <span className="text-zinc-500 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Conte um pouco sobre esse conteúdo..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 resize-none transition"
              {...register("description")}
            />
          </div>

          {/* Quem pode ver */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-zinc-200">Quem pode ver?</label>
            <Controller
              name="contentTier"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-3">
                  {TIERS.map((tier) => {
                    const Icon = tier.icon;
                    const selected = field.value === tier.value;
                    return (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => field.onChange(tier.value)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                          selected
                            ? `${tier.color} ring-2 ${tier.check} ring-offset-2 ring-offset-[#111]`
                            : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        <Icon size={22} />
                        <span className="font-bold text-sm">{tier.label}</span>
                        <span className="text-[11px] leading-tight opacity-75">{tier.desc}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Upload de mídia */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-zinc-200">
              Fotos e vídeos <span className="text-zinc-500 font-normal">(opcional)</span>
            </label>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                dragOver
                  ? "border-[#F5C400] bg-[#F5C400]/5"
                  : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900"
              }`}
            >
              <Upload size={28} className="text-zinc-500" />
              <p className="text-zinc-400 text-sm font-medium">Arraste arquivos ou clique para selecionar</p>
              <p className="text-zinc-600 text-xs">Imagens e vídeos</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              title="Selecionar arquivos"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            {/* Preview dos arquivos */}
            {uploadFiles.length > 0 && (
              <div className="space-y-2">
                {uploadFiles.map((file, i) => {
                  const isVideo = file.type.startsWith("video/");
                  return (
                    <div key={i} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                      <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                        {isVideo
                          ? <FileVideo size={16} className="text-blue-400" />
                          : <ImgIcon size={16} className="text-[#F5C400]" />}
                      </div>
                      <span className="text-sm text-zinc-300 truncate flex-1">{file.name}</span>
                      <span className="text-xs text-zinc-600 shrink-0">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button
                        type="button"
                        title="Remover arquivo"
                        onClick={() => removeFile(i)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  );
                })}
                <p className="text-xs text-zinc-600">{uploadFiles.length} arquivo(s) selecionado(s)</p>
              </div>
            )}
          </div>

          {/* Avançado (PPV / unlock days) */}
          {contentTier !== "FREE" && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Opções avançadas</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-400">
                    Preço PPV (R$)
                    <span className="text-zinc-600 ml-1">— venda avulsa</span>
                  </label>
                  <input
                    type="number" step="0.01" min="0"
                    placeholder="Ex: 9.90"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 text-sm"
                    {...register("ppvPrice", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-400">
                    Libera após (dias)
                    <span className="text-zinc-600 ml-1">— delay</span>
                  </label>
                  <input
                    type="number" min="0"
                    placeholder="Ex: 7"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 text-sm"
                    {...register("unlocksAfterDays", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {published ? "Publicado" : "Salvar como rascunho"}
              </p>
              <p className="text-xs text-zinc-500">
                {published ? "Visível para os assinantes agora" : "Só você pode ver até publicar"}
              </p>
            </div>
            <Controller
              name="published"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  title={field.value ? "Despublicar" : "Publicar"}
                  onClick={() => field.onChange(!field.value)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    field.value ? "bg-[#F5C400]" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      field.value ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              )}
            />
          </div>

          <Button
            type="submit"
            loading={saving || uploading}
            size="lg"
            className="w-full text-base"
          >
            {saving || uploading
              ? uploading ? "Enviando mídia..." : "Salvando..."
              : mode === "create"
                ? published ? "Publicar agora" : "Salvar rascunho"
                : "Salvar alterações"}
          </Button>
        </form>
      </div>
    );
  }

  /* ── LIST ── */
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Conteúdos</h1>
        <Button onClick={startCreate}>
          <Plus size={16} className="mr-1.5" />
          Novo post
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <ImageIcon className="mx-auto mb-3 opacity-30" size={40} />
          <p>Nenhum post criado ainda.</p>
          <button type="button" onClick={startCreate} className="text-[#F5C400] hover:opacity-80 mt-2 text-sm">
            Criar primeiro post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4 min-w-0">
                  {post.media[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.media[0].url} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg shrink-0 flex items-center justify-center">
                      <ImageIcon size={18} className="text-zinc-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{post.title}</p>
                    <p className="text-zinc-500 text-xs">
                      {formatDate(post.createdAt)} · {post._count.media} mídia(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    post.published ? "bg-green-900/50 text-green-400" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {post.published ? <Eye size={10} /> : <EyeOff size={10} />}
                    {post.published ? "Publicado" : "Rascunho"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    post.contentTier === "FREE"
                      ? "bg-green-900/30 text-green-500"
                      : post.contentTier === "BASIC"
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-[#F5C400]/10 text-[#F5C400]"
                  }`}>
                    {post.contentTier === "FREE" ? "Grátis" : post.contentTier === "BASIC" ? "Básico" : "Premium"}
                  </span>
                  <button type="button" title="Editar post" onClick={() => startEdit(post)} className="text-zinc-400 hover:text-white transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button type="button" title="Excluir post" onClick={() => deletePost(post.id)} className="text-zinc-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
