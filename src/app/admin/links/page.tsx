"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Edit2, Check, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface CreatorLink {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
  order: number;
  active: boolean;
}

export default function AdminLinksPage() {
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [adding, setAdding] = useState(false);

  async function loadLinks() {
    const res = await fetch("/api/admin/links");
    const data = await res.json();
    setLinks(data.links ?? []);
    setLoading(false);
  }

  useEffect(() => { loadLinks(); }, []);

  function startEdit(link: CreatorLink) {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditEmoji(link.emoji ?? "");
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, url: editUrl, emoji: editEmoji }),
    });
    setEditingId(null);
    loadLinks();
  }

  async function toggleActive(link: CreatorLink) {
    await fetch(`/api/admin/links/${link.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !link.active }),
    });
    loadLinks();
  }

  async function deleteLink(id: string) {
    if (!confirm("Excluir este link?")) return;
    await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
    loadLinks();
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          url: newUrl.trim(),
          emoji: newEmoji.trim() || null,
          order: links.length,
        }),
      });
      setNewTitle("");
      setNewUrl("");
      setNewEmoji("");
      setShowAdd(false);
      loadLinks();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Links</h1>
          <p className="text-sm text-zinc-500 mt-1">Gerencie os links públicos da página /links</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-1.5" />
          Adicionar
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={addLink} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-semibold text-zinc-300">Novo link</p>
          <div className="grid grid-cols-[60px_1fr] gap-2">
            <input
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              placeholder="🔗"
              maxLength={4}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30"
            />
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título do link"
              required
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 text-sm"
            />
          </div>
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
            type="url"
            required
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 text-sm"
          />
          <div className="flex gap-2">
            <Button type="submit" loading={adding} size="sm">Salvar</Button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p>Nenhum link criado ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className={`flex items-center gap-3 bg-zinc-900 border rounded-xl px-4 py-3 transition-all ${
                link.active ? "border-zinc-800" : "border-zinc-900 opacity-60"
              }`}
            >
              {editingId === link.id ? (
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-[60px_1fr] gap-2">
                    <input
                      value={editEmoji}
                      onChange={(e) => setEditEmoji(e.target.value)}
                      maxLength={4}
                      className="px-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 text-sm"
                    />
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 text-sm"
                    />
                  </div>
                  <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(link.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5C400] text-black text-xs font-semibold hover:bg-[#FFD700] transition-colors"
                    >
                      <Check size={12} /> Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 rounded-lg text-zinc-500 hover:text-white text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {link.emoji && <span className="text-xl shrink-0">{link.emoji}</span>}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{link.title}</p>
                    <p className="text-zinc-500 text-xs truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title={link.active ? "Desativar" : "Ativar"}
                      onClick={() => toggleActive(link)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    >
                      {link.active ? (
                        <ToggleRight size={18} className="text-[#F5C400]" />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => startEdit(link)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      onClick={() => deleteLink(link.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
