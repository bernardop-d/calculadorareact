import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContentHub — Conteúdo Exclusivo",
  description: "Conteúdo exclusivo para maiores de 18 anos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-white">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
