"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { User, Save, CheckCircle } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then(({ profile: p }) => {
        if (p) {
          setProfile(p);
          setName(p.name ?? "");
          setBio(p.bio ?? "");
          setAvatarUrl(p.avatarUrl ?? "");
          setCoverUrl(p.coverUrl ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatarUrl, coverUrl }),
      });
      if (res.ok) {
        const { profile: p } = await res.json();
        setProfile(p);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-900 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/30 flex items-center justify-center">
          <User size={16} className="text-[#F5C400]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Perfil da Criadora</h1>
          <p className="text-sm text-zinc-500">Edite as informações públicas do perfil</p>
        </div>
      </div>

      {profile?.avatarUrl && (
        <div className="mb-6 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-[#F5C400]/30"
          />
          <div>
            <p className="text-white font-semibold">{profile.name}</p>
            <p className="text-zinc-500 text-sm">{profile.bio ?? "Sem bio"}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-zinc-200">Nome *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Queen Rayalla"
            required
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-zinc-200">
            Bio <span className="text-zinc-500 font-normal">(opcional)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Conte um pouco sobre você..."
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 resize-none transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-zinc-200">
            URL do Avatar <span className="text-zinc-500 font-normal">(opcional)</span>
          </label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            type="url"
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-zinc-200">
            URL da Capa <span className="text-zinc-500 font-normal">(opcional)</span>
          </label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            type="url"
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40 transition"
          />
        </div>

        <Button type="submit" loading={saving} size="lg" className="w-full text-base">
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Salvo!
            </span>
          ) : saving ? (
            "Salvando..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Save size={16} />
              Salvar perfil
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
