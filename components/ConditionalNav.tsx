"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// Pages that use full-screen layout (no navbar / no top padding)
const FULLSCREEN_PATHS = ["/login", "/register"];

export default function ConditionalNav() {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_PATHS.includes(pathname);

  if (isFullscreen) return null;

  return (
    <>
      <Navbar />
      <div className="pt-16" />
    </>
  );
}
