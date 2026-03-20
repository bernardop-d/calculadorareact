"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, FileImage, CreditCard, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalPosts: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = stats
    ? [
        {
          title: "Total de usuários",
          value: stats.totalUsers,
          icon: <Users size={20} className="text-blue-400" />,
          color: "text-blue-400",
        },
        {
          title: "Assinantes ativos",
          value: stats.activeSubscriptions,
          icon: <TrendingUp size={20} className="text-green-400" />,
          color: "text-green-400",
        },
        {
          title: "Posts publicados",
          value: stats.totalPosts,
          icon: <FileImage size={20} className="text-rose-400" />,
          color: "text-rose-400",
        },
        {
          title: "Receita total",
          value: formatCurrency(stats.totalRevenue),
          icon: <CreditCard size={20} className="text-yellow-400" />,
          color: "text-yellow-400",
        },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {!stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  {card.icon}
                </div>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
