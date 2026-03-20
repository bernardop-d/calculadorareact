"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, FileImage, Users, CreditCard, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Conteúdos", icon: FileImage },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/payments", label: "Pagamentos", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace("/login");
  }, [user, isAdmin, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Admin</p>
          <p className="text-sm text-white font-medium truncate">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-rose-600/20 text-rose-400 font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 w-full transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
