"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface Event {
  id: string;
  event: string;
  postId: string | null;
  createdAt: string;
  metadata: string | null;
  user: { email: string; name: string | null };
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  PRINT_SCREEN:   { label: "Print Screen",       color: "text-red-400" },
  SCREEN_SHARE:   { label: "Gravação de tela",   color: "text-orange-400" },
  DEVTOOLS:       { label: "DevTools aberto",    color: "text-yellow-400" },
  FOCUS_LOSS:     { label: "Troca de janela",    color: "text-zinc-400" },
  KEYBOARD_BLOCK: { label: "Atalho bloqueado",   color: "text-blue-400" },
};

export default function SecurityPage() {
  const { data, isLoading, refetch, isFetching } = useQuery<{ events: Event[] }>({
    queryKey: ["admin-security"],
    queryFn: () => fetch("/api/admin/security").then((r) => r.json()),
    staleTime: 0,
    gcTime: 0,
  });

  const events = data?.events ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-rose-400" size={24} />
          <h1 className="text-xl font-bold text-white">Eventos de Segurança</h1>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Atualizar
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-zinc-500 text-center py-20">Nenhum evento registrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-500 text-left">
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Post</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const meta = ev.metadata ? JSON.parse(ev.metadata) : {};
                const info = EVENT_LABELS[ev.event] ?? { label: ev.event, color: "text-zinc-300" };
                return (
                  <tr key={ev.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">
                      {ev.user.name ?? ev.user.email}
                      <span className="block text-xs text-zinc-500">{ev.user.email}</span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${info.color}`}>{info.label}</td>
                    <td className="px-4 py-3 text-zinc-400">{ev.postId ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{meta.ip ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(ev.createdAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
