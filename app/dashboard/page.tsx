"use client";

import { Suspense, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Lock, Image as ImageIcon, CreditCard, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  description: string | null;
  isPremium: boolean;
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<"content" | "payments" | "profile">(
    "content"
  );
  const [postsLoading, setPostsLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && !isSubscribed) router.replace("/payment");
  }, [user, isSubscribed, loading, router]);

  useEffect(() => {
    if (!isSubscribed) return;
    let cancelled = false;

    async function load() {
      const [postsRes, paymentsRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/payments/history"),
      ]);
      if (cancelled) return;
      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts);
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments);
      }
      setPostsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [isSubscribed]);

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
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {paymentSuccess && (
        <div className="bg-green-950/50 border border-green-700 rounded-xl p-4 mb-6 text-green-400 text-sm text-center">
          🎉 Pagamento confirmado! Bem-vindo ao conteúdo exclusivo.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá, {user.name || "Assinante"}!
          </h1>
          <p className="text-zinc-400 text-sm">
            {isSubscribed
              ? `Assinatura ativa até ${user.subscription?.currentPeriodEnd ? formatDate(user.subscription.currentPeriodEnd) : "—"}`
              : "Assinatura inativa"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-8 w-fit">
        {(["content", "payments", "profile"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-rose-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab === "content" ? "Conteúdos" : tab === "payments" ? "Pagamentos" : "Perfil"}
          </button>
        ))}
      </div>

      {/* Content tab */}
      {activeTab === "content" && (
        <div>
          {postsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-zinc-900 rounded-xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              Nenhum conteúdo disponível ainda. Volte em breve!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link href={`/content/${post.id}`} key={post.id}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-rose-800/50 transition-all hover:scale-[1.02] cursor-pointer group">
                    <div className="relative aspect-[4/3] bg-zinc-800 flex items-center justify-center">
                      {post.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-zinc-600" size={40} />
                      )}
                      {post.locked && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                          <Lock className="text-rose-400 mb-2" size={32} />
                          <span className="text-white text-sm font-medium">Premium</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 rounded-md px-2 py-0.5 text-xs text-zinc-300 flex items-center gap-1">
                        <ImageIcon size={10} />
                        {post.mediaCount}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-zinc-500 text-sm mt-1 line-clamp-2">
                          {post.description}
                        </p>
                      )}
                      <p className="text-zinc-600 text-xs mt-2">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments tab */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Histórico de pagamentos</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePortal}
              loading={portalLoading}
            >
              <CreditCard size={14} className="mr-1.5" />
              Gerenciar assinatura
            </Button>
          </div>

          {payments.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">Nenhum pagamento encontrado.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-zinc-400" />
                      <div>
                        <p className="text-sm text-white">{p.description || "Pagamento"}</p>
                        <p className="text-xs text-zinc-500">{formatDate(p.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(p.amount, p.currency.toUpperCase())}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          p.status === "succeeded"
                            ? "bg-green-900/50 text-green-400"
                            : "bg-red-900/50 text-red-400"
                        }`}
                      >
                        {p.status === "succeeded" ? "Aprovado" : "Falhou"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="max-w-md space-y-6">
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Nome</label>
                <p className="text-white mt-1">{user.name || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Email</label>
                <p className="text-white mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Status da assinatura</label>
                <p className={`mt-1 font-medium ${isSubscribed ? "text-green-400" : "text-red-400"}`}>
                  {isSubscribed ? "Ativa" : "Inativa"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full"
            onClick={handlePortal}
            loading={portalLoading}
          >
            <CreditCard size={14} className="mr-2" />
            Gerenciar assinatura no Stripe
          </Button>

          <Button variant="danger" className="w-full" onClick={logout}>
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
