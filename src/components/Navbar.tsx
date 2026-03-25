"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "./ui/Button";
import { useState } from "react";
import { Menu, X, Crown, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, logout, isSubscribed, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="w-full px-6 sm:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#F5C400]/10 border border-[#F5C400]/40 rounded-lg flex items-center justify-center">
              <Crown size={16} className="text-[#F5C400]" />
            </div>
            <span className="font-bold text-base tracking-wide">
              <span className="text-white">Queen </span>
              <span className="text-[#F5C400]">Rayalla</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
                      Conteúdos
                    </Link>
                    {isSubscribed && (
                      <Link href="/dashboard/payments" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
                        Assinaturas
                      </Link>
                    )}
                    {!isSubscribed && (
                      <Link href="/payment">
                        <Button size="sm">Assinar</Button>
                      </Link>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-zinc-500 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button type="button" className="text-sm text-zinc-300 hover:text-white transition-colors px-4 py-2">
                    Entrar
                  </button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden text-zinc-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/5 px-4 py-4 space-y-2" onClick={() => setMenuOpen(false)}>
          {user ? (
            <>
              {isAdmin ? (
                <Link href="/admin" className="block py-2 text-zinc-300 hover:text-white">Admin</Link>
              ) : (
                <>
                  <Link href="/dashboard" className="block py-2 text-zinc-300 hover:text-white">Conteúdos</Link>
                  {isSubscribed && (
                    <Link href="/dashboard/payments" className="block py-2 text-zinc-300 hover:text-white">Minhas assinaturas</Link>
                  )}
                  {!isSubscribed && (
                    <Link href="/payment"><Button className="w-full mt-1">Assinar Agora</Button></Link>
                  )}
                </>
              )}
              <button type="button" onClick={logout} className="block w-full text-left py-2 text-zinc-500 hover:text-white text-sm">Sair</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-zinc-300 hover:text-white text-sm">Entrar</Link>
              <Link href="/register"><Button className="w-full mt-1">Cadastrar</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
