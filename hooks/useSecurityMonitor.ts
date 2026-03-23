"use client";

import { useEffect, useRef } from "react";

interface Options {
  postId?: string;
}

/**
 * Detecta e loga eventos suspeitos de captura de tela / gravação.
 * Chame dentro da página de conteúdo protegido.
 */
export function useSecurityMonitor({ postId }: Options = {}) {
  // Evita enviar o mesmo evento várias vezes em sequência
  const lastSent = useRef<Record<string, number>>({});

  const log = (event: string) => {
    const now = Date.now();
    const last = lastSent.current[event] ?? 0;
    if (now - last < 5000) return; // debounce 5s por tipo de evento
    lastSent.current[event] = now;

    fetch("/api/security/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, postId }),
    }).catch(() => {});
  };

  useEffect(() => {
    // ── 1. Tecla Print Screen ────────────────────────────────
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        log("PRINT_SCREEN");
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "p", "u", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        log("KEYBOARD_BLOCK");
      }
    };

    // ── 2. Tentativa de compartilhamento / gravação de tela ──
    const originalGetDisplayMedia =
      navigator.mediaDevices?.getDisplayMedia?.bind(navigator.mediaDevices);
    if (originalGetDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async (options) => {
        log("SCREEN_SHARE");
        return originalGetDisplayMedia(options);
      };
    }

    // ── 3. Página ficou invisível (Alt+Tab / troca de janela) ─
    const handleVisibility = () => {
      if (document.hidden) log("FOCUS_LOSS");
    };

    // ── 4. DevTools aberto (detecta por tamanho da janela) ───
    const devToolsCheck = setInterval(() => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        log("DEVTOOLS");
      }
    }, 3000);

    window.addEventListener("keydown", handleKey);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(devToolsCheck);
      // Restaura getDisplayMedia original ao sair da página
      if (originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);
}
