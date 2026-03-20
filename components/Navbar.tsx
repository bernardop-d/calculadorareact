"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Button from "./ui/Button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout, isSubscribed, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            <span className="text-rose-500">✦</span> ContentHub
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {!isAdmin && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm text-zinc-300 hover:text-white transition-colors"
                    >
                      Conteúdos
                    </Link>
                    {!isSubscribed && (
                      <Link href="/payment">
                        <Button size="sm" variant="primary">
                          Assinar
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                <button
                  onClick={logout}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-zinc-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-4 space-y-3">
          {user ? (
            <>
              {isAdmin ? (
                <Link href="/admin" className="block text-zinc-300 hover:text-white">
                  Admin
                </Link>
              ) : (
                <>
                  <Link href="/dashboard" className="block text-zinc-300 hover:text-white">
                    Conteúdos
                  </Link>
                  {!isSubscribed && (
                    <Link href="/payment" className="block">
                      <Button size="sm" className="w-full">
                        Assinar Agora
                      </Button>
                    </Link>
                  )}
                </>
              )}
              <button
                onClick={logout}
                className="block w-full text-left text-zinc-400 hover:text-white"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block">
                <Button variant="ghost" size="sm" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button size="sm" className="w-full">
                  Cadastrar
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
