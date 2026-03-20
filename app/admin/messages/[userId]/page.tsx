"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  fromUser: { id: string; name: string | null };
}

interface Fan {
  id: string;
  name: string | null;
  email: string;
}

export default function AdminThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [fan, setFan] = useState<Fan | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { params.then((p) => setUserId(p.userId)); }, [params]);

  const fetchMessages = () => {
    if (!userId) return;
    fetch(`/api/admin/messages/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? []);
        setFan(d.fan ?? null);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user || !userId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending || !userId) return;
    setSending(true);
    await fetch(`/api/admin/messages/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    setBody("");
    setSending(false);
    fetchMessages();
  }

  if (!user) return null;

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/messages" className="text-zinc-500 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-white font-bold">{fan?.name ?? fan?.email ?? "Fã"}</p>
          <p className="text-zinc-600 text-xs">{fan?.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMine = msg.fromUser.id === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMine ? "bg-[#F5C400] text-black rounded-br-sm" : "bg-white/[0.06] text-white rounded-bl-sm"
              }`}>
                <p className="text-sm leading-relaxed">{msg.body}</p>
                <p className={`text-[10px] mt-1 ${isMine ? "text-black/50" : "text-zinc-600"}`}>
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 mt-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Responder..."
          maxLength={1000}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="w-11 h-11 bg-[#F5C400] rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#FFD700] transition-colors"
        >
          <Send size={16} className="text-black" />
        </button>
      </form>
    </div>
  );
}
