"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LikeButton from "@/components/LikeButton";
import StoriesBar from "@/components/StoriesBar";
import {
  Lock, Image as ImageIcon, CreditCard, Calendar, Crown,
  MessageCircle, Heart, Flame,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  description: string | null;
  isPremium: boolean;
  contentTier: string;
  ppvPrice: number | null;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  createdAt: string;
  mediaCount: number;
  thumbnail: string | null;
  locked: boolean;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
}

function DashboardContent() {
  const { user, isSubscribed, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<"content" | "payments" | "profile">("content");
  const [postsLoading, setPostsLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const loadPosts = useCallback(async (cursor?: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const url = `/api/posts${cursor ? `?cursor=${cursor}` : ""}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => cursor ? [...prev, ...data.posts] : data.posts);
      setNextCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    }
    setPostsLoading(false);
    setFetchingMore(false);
    isFetchingRef.current = false;
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    loadPosts();
    fetch("/api/payments/history")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []));
    fetch("/api/messages/unread-count")
      .then((r) => r.json())
      .then((d) => setUnreadMessages(d.count ?? 0))
      .catch(() => {});
  }, [loading, user, loadPosts]);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetchingRef.current && nextCursor) {
          setFetchingMore(true);
          loadPosts(nextCursor);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, loadPosts]);

  async function handlePortal() {
    setPortalLoading(true);
    const res = await fetch("/api/payments/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  }

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {paymentSuccess && (
        <div className="bg-[#F5C400]/10 border border-[#F5C400]/30 rounded-xl p-4 mb-6 text-[#F5C400] text-sm text-center">
          Pagamento confirmado! Seja bem-vindo ao conteúdo exclusivo.
        </div>
      )}

      {!isSubscribed && (
        <div className="bg-white/[0.03] border border-[#F5C400]/20 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F5C400]/10 rounded-xl flex items-center justify-center shrink-0">
              <Crown size={18} className="text-[#F5C400]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Desbloqueie todo o conteúdo</p>
              <p className="text-zinc-500 text-xs">Assine e veja tudo sem blur a partir de R$19,90/mês</p>
            </div>
          </div>
          <Link href="/payment">
            <Button size="sm" className="shrink-0">
              <Flame size={13} className="mr-1.5" />
              Assinar agora
            </Button>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Olá, {user.name || "Visitante"}!</h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {isSubscribed ? "Assinatura ativa" : "Navegando como visitante"}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={logout}>Sair</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 mb-7 w-fit overflow-x-auto">
        {(["content", "payments", "profile"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab ? "bg-[#F5C400] text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab === "content" ? "Conteúdos" : tab === "payments" ? "Pagamentos" : "Perfil"}
          </button>
        ))}
        <Link href="/dashboard/messages" className="relative">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
          >
            <MessageCircle size={13} />
            Mensagens
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
        </Link>
      </div>

      {/* ── Content tab ── */}
      {activeTab === "content" && (
        <div>
          <StoriesBar />

          {postsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">
              Nenhum conteúdo publicado ainda. Volte em breve!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {posts.map((post) => (
                  <div key={post.id} className="group bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-[#F5C400]/20 transition-all">
                    <Link href={post.locked ? "/payment" : `/content/${post.id}`}>
                      <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                        {post.thumbnail ? (
                          <>
                            {/* Partial preview: top 25% visible, rest blurred */}
                            {post.locked ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={post.thumbnail}
                                  alt={post.title}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className="object-cover clip-top-25"
                                  unoptimized={post.thumbnail.startsWith("http")}
                                />
                                <Image
                                  src={post.thumbnail}
                                  alt=""
                                  aria-hidden="true"
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className="object-cover blur-xl scale-110 brightness-75 clip-bottom-75"
                                  unoptimized={post.thumbnail.startsWith("http")}
                                />
                                <div className="absolute left-0 right-0 h-8 preview-fade" />
                              </div>
                            ) : (
                              <Image
                                src={post.thumbnail}
                                alt={post.title}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized={post.thumbnail.startsWith("http")}
                              />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="text-zinc-700" size={32} />
                          </div>
                        )}

                        {post.locked && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 mt-6">
                            <div className="w-10 h-10 bg-black/70 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <Lock size={16} className="text-[#F5C400]" />
                            </div>
                            {post.ppvPrice ? (
                              <span className="text-xs font-bold text-[#F5C400] bg-black/60 px-2.5 py-1 rounded-full">
                                R${(post.ppvPrice / 100).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-white bg-black/50 px-2.5 py-1 rounded-full">Assinar</span>
                            )}
                          </div>
                        )}

                        <div className="absolute top-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5 text-xs text-zinc-300 flex items-center gap-1">
                          <ImageIcon size={9} />
                          {post.mediaCount}
                        </div>
                      </div>
                    </Link>

                    <div className="p-2.5">
                      <p className="text-white text-xs font-semibold truncate group-hover:text-[#F5C400] transition-colors mb-1.5">
                        {post.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-zinc-600 text-xs">{formatDate(post.createdAt)}</p>
                        <div className="flex items-center gap-2.5">
                          <LikeButton
                            postId={post.id}
                            initialCount={post.likeCount}
                            initialLiked={post.likedByMe}
                            isAuthenticated={!!user}
                          />
                          <Link href={`/content/${post.id}`} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300">
                            <MessageCircle size={13} />
                            <span>{post.commentCount}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
                {fetchingMore && (
                  <div className="w-5 h-5 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
                )}
                {!hasMore && posts.length > 0 && (
                  <p className="text-zinc-700 text-xs">Você viu tudo.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Payments tab ── */}
      {activeTab === "payments" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-zinc-300">Histórico de pagamentos</h2>
            {isSubscribed && (
              <Button variant="secondary" size="sm" onClick={handlePortal} loading={portalLoading}>
                <CreditCard size={13} className="mr-1.5" />
                Gerenciar assinatura
              </Button>
            )}
          </div>
          {payments.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-12">Nenhum pagamento encontrado.</p>
          ) : (
            payments.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-zinc-500" />
                    <div>
                      <p className="text-sm text-white">{p.description || "Pagamento"}</p>
                      <p className="text-xs text-zinc-500">{formatDate(p.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(p.amount, p.currency.toUpperCase())}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "succeeded" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
                    }`}>
                      {p.status === "succeeded" ? "Aprovado" : "Falhou"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Profile tab ── */}
      {activeTab === "profile" && (
        <div className="max-w-sm space-y-4">
          <Card>
            <CardContent className="space-y-4 py-5">
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Nome</p>
                <p className="text-white mt-1">{user.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Email</p>
                <p className="text-white mt-1">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Assinatura</p>
                <p className={`mt-1 font-semibold text-sm ${isSubscribed ? "text-[#F5C400]" : "text-zinc-500"}`}>
                  {isSubscribed ? "Ativa" : "Inativa"}
                </p>
              </div>
            </CardContent>
          </Card>

          {isSubscribed && (
            <Button variant="secondary" className="w-full" onClick={handlePortal} loading={portalLoading}>
              <CreditCard size={14} className="mr-2" />
              Gerenciar assinatura
            </Button>
          )}
          {!isSubscribed && (
            <Link href="/payment">
              <Button className="w-full">
                <Crown size={14} className="mr-2" />
                Assinar agora
              </Button>
            </Link>
          )}
          <Link href="/dashboard/messages">
            <Button variant="secondary" className="w-full">
              <MessageCircle size={14} className="mr-2" />
              Mensagens
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="secondary" className="w-full">
              <Heart size={14} className="mr-2" />
              Perfil da Rayalla
            </Button>
          </Link>
          <Button type="button" variant="ghost" className="w-full text-zinc-500 hover:text-red-400" onClick={logout}>
            Sair da conta
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
