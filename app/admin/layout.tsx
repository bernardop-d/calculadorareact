"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, FileImage, Users, CreditCard, LogOut, Crown, Layers, MessageCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Conteúdos", icon: FileImage },
  { href: "/admin/stories", label: "Stories", icon: Layers },
  { href: "/admin/messages", label: "Mensagens", icon: MessageCircle },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/payments", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/security", label: "Segurança", icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace("/login");
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const fetchUnread = () => {
      fetch("/api/admin/unread-count")
        .then((r) => r.json())
        .then((d) => setUnreadMessages(d.count ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [user, isAdmin]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-60 bg-black/60 border-r border-white/5 hidden md:flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 bg-[#F5C400]/10 border border-[#F5C400]/30 rounded-lg flex items-center justify-center">
              <Crown size={13} className="text-[#F5C400]" />
            </div>
            <span className="text-sm font-bold">
              <span className="text-white">Queen </span>
              <span className="text-[#F5C400]">Rayalla</span>
            </span>
          </div>
          <p className="text-xs text-zinc-600 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const badge = item.href === "/admin/messages" && unreadMessages > 0 ? unreadMessages : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  active
                    ? "bg-[#F5C400]/10 text-[#F5C400] font-semibold"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={15} />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 bg-[#F5C400] rounded-full text-black text-[10px] font-black flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-white hover:bg-white/5 w-full transition-all"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto bg-[#080808]">
        {children}
      </div>
    </div>
  );
}
