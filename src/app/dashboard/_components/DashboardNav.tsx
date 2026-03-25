"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Conteúdos" },
  { href: "/dashboard/payments", label: "Pagamentos" },
  { href: "/dashboard/profile", label: "Perfil" },
] as const;

export default function DashboardNav({ unreadMessages }: { unreadMessages: number }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 bg-white/4 border border-white/6 rounded-xl p-1 mb-7 w-fit overflow-x-auto">
      {tabs.map(({ href, label }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard" || pathname === "/dashboard/"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              active ? "bg-[#F5C400] text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <Link href="/dashboard/messages" className="relative">
        <span className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-all flex items-center gap-1.5">
          <MessageCircle size={13} />
          Mensagens
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </span>
      </Link>
    </div>
  );
}
