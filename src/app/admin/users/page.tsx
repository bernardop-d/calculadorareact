"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription: { status: string; currentPeriodEnd: string } | null;
}

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery<{ users: User[]; total: number }>({
    queryKey: ["admin-users"],
    queryFn: () => fetch("/api/admin/users").then((r) => r.json()),
    staleTime: 0,
    gcTime: 0,
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <Users size={16} />
          {total} usuários
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white text-sm font-medium">{user.name || "—"}</p>
                  <p className="text-zinc-500 text-xs">{user.email}</p>
                  <p className="text-zinc-600 text-xs">
                    Cadastrado em {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {user.role === "ADMIN" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-400">
                      Admin
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      user.subscription?.status === "ACTIVE"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {user.subscription?.status === "ACTIVE" ? "Assinante" : "Sem plano"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
