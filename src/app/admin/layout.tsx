"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { LayoutDashboard, FileImage, Users, CreditCard, LogOut, Crown, Layers, MessageCircle, ShieldAlert, Sun, Moon, MessageSquare, User, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Conteúdos", icon: FileImage },
  { href: "/admin/stories", label: "Stories", icon: Layers },
  { href: "/admin/comments", label: "Comentários", icon: MessageSquare },
  { href: "/admin/messages", label: "Mensagens", icon: MessageCircle },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/payments", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/security", label: "Segurança", icon: ShieldAlert },
  { href: "/admin/profile", label: "Perfil", icon: User },
  { href: "/admin/links", label: "Links", icon: LinkIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace("/login");
  }, [user, isAdmin, loading, router]);

  const { data: profileData } = useQuery<{ profile: { name: string } }>({
    queryKey: ["admin-creator-profile"],
    queryFn: () => fetch("/api/admin/profile").then((r) => r.json()),
    enabled: !!user && !!isAdmin,
    staleTime: 60_000,
  });

  const creatorName = profileData?.profile?.name ?? "Queen Rayalla";
  const [creatorFirst, ...creatorRest] = creatorName.split(" ");
  const creatorLast = creatorRest.join(" ");

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["admin-unread-count"],
    queryFn: () => fetch("/api/admin/unread-count").then((r) => r.json()),
    enabled: !!user && !!isAdmin,
    refetchInterval: 60_000,
    staleTime: 0,
    gcTime: 0,
  });

  const unreadMessages = unreadData?.count ?? 0;

  if (loading || !user) return null;

  return (
    <div className="flex min-h-[100vh]">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-[#0a0a0a] border-r border-white/6">

        {/* Profile header */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/30 flex items-center justify-center shrink-0">
              <Crown size={15} className="text-[#F5C400]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">
                <span className="text-white">{creatorFirst}{creatorLast ? " " : ""}</span>
                {creatorLast && <span className="text-[#F5C400]">{creatorLast}</span>}
              </p>
              <p className="text-[11px] text-zinc-600 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F5C400]/5 border border-[#F5C400]/10 w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5C400] animate-pulse" />
            <span className="text-[10px] text-[#F5C400]/70 font-medium tracking-wide uppercase">Admin</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.05]" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
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
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                  active
                    ? "bg-[#F5C400]/10 text-[#F5C400] font-semibold"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                )}
              >
                <Icon size={16} className={cn("shrink-0 transition-colors", active ? "text-[#F5C400]" : "text-zinc-600 group-hover:text-zinc-400")} />
                <span className="flex-1 tracking-tight">{item.label}</span>
                {badge > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-[#F5C400] rounded-full text-black text-[10px] font-black flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
                {active && <div className="w-1 h-1 rounded-full bg-[#F5C400]/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mx-4 h-px bg-white/[0.05]" />
        <div className="px-3 py-4">
          <button
            type="button"
            onClick={logout}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-600 hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-150"
          >
            <LogOut size={16} className="shrink-0 group-hover:text-red-400 transition-colors" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main flex-1 flex flex-col overflow-hidden bg-[#080808]">
        {/* Top bar */}
        <div className="admin-topbar flex items-center justify-end px-6 lg:px-8 h-14 border-b border-white/[0.04] shrink-0">
          <button
            type="button"
            onClick={toggle}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-all duration-150"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
