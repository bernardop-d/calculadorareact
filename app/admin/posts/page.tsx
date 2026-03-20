"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Plus, Pencil, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema } from "@/lib/validations";

interface PostFormData {
  title: string;
  description?: string;
  isPremium: boolean;
  published: boolean;
}

interface Post {
  id: string;
  title: string;
  description: string | null;
  isPremium: boolean;
  published: boolean;
  createdAt: string;
  _count: { media: number };
  media: { url: string; type: string }[];
}

type Mode = "list" | "create" | "edit";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({ resolver: zodResolver(postSchema) });

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function startCreate() {
    setEditingPost(null);
    reset({ title: "", description: "", isPremium: true, published: false });
    setMode("create");
  }

  function startEdit(post: Post) {
    setEditingPost(post);
    reset({
      title: post.title,
      description: post.description ?? "",
      isPremium: post.isPremium,
      published: post.published,
    });
    setMode("edit");
  }

  async function onSubmit(data: PostFormData) {
    setSaving(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const created = await res.json();

        if (uploadFiles && uploadFiles.length > 0 && created.post) {
          await uploadMedia(created.post.id, uploadFiles);
        }
      } else if (editingPost) {
        await fetch(`/api/admin/posts/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (uploadFiles && uploadFiles.length > 0) {
          await uploadMedia(editingPost.id, uploadFiles);
        }
      }

      await fetchPosts();
      setMode("list");
      setUploadFiles(null);
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(postId: string, files: FileList) {
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    await fetch(`/api/admin/posts/${postId}/media`, {
      method: "POST",
      body: formData,
    });
    setUploading(false);
  }

  async function deletePost(id: string) {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  if (mode !== "list") {
    return (
      <div className="p-6 lg:p-8 max-w-2xl">
        <button
          onClick={() => setMode("list")}
          className="text-zinc-400 hover:text-white text-sm mb-6"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-white mb-8">
          {mode === "create" ? "Novo post" : "Editar post"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Título"
            id="title"
            placeholder="Título do post"
            error={errors.title?.message}
            {...register("title")}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Descrição (opcional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              rows={3}
              placeholder="Descrição do post"
              {...register("description")}
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
              <input type="checkbox" className="accent-rose-500" {...register("isPremium")} />
              Premium (requer assinatura)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
              <input type="checkbox" className="accent-rose-500" {...register("published")} />
              Publicado
            </label>
          </div>

          {/* File upload */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              <Upload size={14} className="inline mr-1.5" />
              Adicionar mídia (imagens/vídeos)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setUploadFiles(e.target.files)}
              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
            />
            {uploadFiles && (
              <p className="text-xs text-zinc-500">
                {uploadFiles.length} arquivo(s) selecionado(s)
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={saving || uploading}
            size="lg"
            className="w-full"
          >
            {mode === "create" ? "Criar post" : "Salvar alterações"}
          </Button>
        </form>
      </div>
    );
  }

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
          Nenhum post criado ainda.
          <br />
          <button
            onClick={startCreate}
            className="text-rose-400 hover:text-rose-300 mt-2"
          >
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
                    <img
                      src={post.media[0].url}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{post.title}</p>
                    <p className="text-zinc-500 text-xs">
                      {formatDate(post.createdAt)} · {post._count.media} mídias
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      post.published
                        ? "bg-green-900/50 text-green-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {post.published ? (
                      <Eye size={10} className="inline mr-1" />
                    ) : (
                      <EyeOff size={10} className="inline mr-1" />
                    )}
                    {post.published ? "Publicado" : "Rascunho"}
                  </span>
                  {post.isPremium && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-900/50 text-rose-400">
                      Premium
                    </span>
                  )}
                  <button
                    onClick={() => startEdit(post)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-zinc-400 hover:text-red-400 transition-colors"
                  >
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
