"use client";

import { useEffect, useState } from "react";
import { Users, FileImage, CreditCard, TrendingUp, TrendingDown, MessageCircle, Heart, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalPosts: number;
  totalRevenue: number;
  newFansThisWeek: number;
  cancelledLast30: number;
  churnRate: number;
  revenueThisMonth: number;
  totalTips: number;
  unreadMessages: number;
  topPosts: { id: string; title: string; likeCount: number }[];
}

function StatCard({
  title,
  value,
  sub,
  icon,
  accent,
  href,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white/[0.03] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <p className={`text-3xl font-black ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-black text-white mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-black text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Assinantes ativos"
          value={stats.activeSubscriptions}
          icon={<TrendingUp size={18} className="text-green-400" />}
          accent="text-green-400"
        />
        <StatCard
          title="Novos essa semana"
          value={`+${stats.newFansThisWeek}`}
          icon={<Users size={18} className="text-blue-400" />}
          accent="text-blue-400"
        />
        <StatCard
          title="Cancelamentos (30d)"
          value={stats.cancelledLast30}
          sub={`Churn: ${stats.churnRate}%`}
          icon={<TrendingDown size={18} className="text-red-400" />}
          accent="text-red-400"
        />
        <StatCard
          title="Total de usuários"
          value={stats.totalUsers}
          icon={<Users size={18} className="text-zinc-400" />}
          accent="text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Receita este mês"
          value={formatCurrency(stats.revenueThisMonth)}
          icon={<DollarSign size={18} className="text-[#F5C400]" />}
          accent="text-[#F5C400]"
        />
        <StatCard
          title="Receita total"
          value={formatCurrency(stats.totalRevenue)}
          icon={<CreditCard size={18} className="text-yellow-600" />}
          accent="text-yellow-500"
        />
        <StatCard
          title="Total em gorjetas"
          value={formatCurrency(stats.totalTips)}
          icon={<Heart size={18} className="text-pink-400" />}
          accent="text-pink-400"
        />
        <StatCard
          title="Mensagens não lidas"
          value={stats.unreadMessages}
          icon={<MessageCircle size={18} className="text-[#F5C400]" />}
          accent={stats.unreadMessages > 0 ? "text-[#F5C400]" : "text-zinc-400"}
          href="/admin/messages"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top posts */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={14} className="text-red-400" />
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Posts mais curtidos</h2>
          </div>
          {stats.topPosts.length === 0 ? (
            <p className="text-zinc-600 text-sm">Nenhum post ainda.</p>
          ) : (
            <div className="space-y-2">
              {stats.topPosts.map((post, i) => (
                <div key={post.id} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 w-4">{i + 1}.</span>
                  <p className="flex-1 text-sm text-zinc-300 truncate">{post.title}</p>
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <Heart size={10} className="fill-red-400" />
                    {post.likeCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Atalhos</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/admin/posts", label: "Novo conteúdo", icon: <FileImage size={14} /> },
              { href: "/admin/stories", label: "Novo story", icon: <FileImage size={14} /> },
              { href: "/admin/messages", label: "Ver mensagens", icon: <MessageCircle size={14} /> },
              { href: "/admin/payments", label: "Pagamentos", icon: <CreditCard size={14} /> },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] hover:border-[#F5C400]/20 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:text-white transition-all"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
