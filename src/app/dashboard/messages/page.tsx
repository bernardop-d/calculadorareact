"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  fromUser: { id: string; name: string | null; avatarUrl: string | null };
}

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const fetchMessages = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? []);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (res.ok) {
        setBody("");
        fetchMessages();
      }
    } catch {
      // keep body on error so user can retry
    } finally {
      setSending(false);
    }
  }

  if (loading || !user) return null;

  const myId = user.id;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F5C400]/10 border border-[#F5C400]/30 flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/creator.jpg" alt="" className="w-full h-full object-cover object-top" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Queen Rayalla</p>
          <p className="text-zinc-600 text-xs">Mensagem privada</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-zinc-600 text-sm py-10">
            Manda uma mensagem. Eu adoro saber o que você tá pensando...
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.fromUser.id === myId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMine
                  ? "bg-[#F5C400] text-black rounded-br-sm"
                  : "bg-white/6 text-white rounded-bl-sm"
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

      {/* Input */}
      <form onSubmit={send} className="flex gap-2 mt-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva sua mensagem..."
          maxLength={1000}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/40"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="w-11 h-11 bg-[#F5C400] rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#FFD700] transition-colors shrink-0"
        >
          <Send size={16} className="text-black" />
        </button>
      </form>
    </div>
  );
}
