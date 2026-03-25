"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/dashboard/messages", label: "Chat", icon: MessageCircle },
] as const;

export default function BottomNav({ unreadMessages }: { unreadMessages: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-md border-t border-white/8">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname === href || pathname.startsWith(`${href}/`);

          const isChat = href === "/dashboard/messages";

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 flex-1 py-2 relative"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={active ? "text-[#F5C400]" : "text-zinc-500"}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {isChat && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center px-0.5">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${active ? "text-[#F5C400]" : "text-zinc-500"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
