import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalNav from "@/components/ConditionalNav";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Queen Rayalla — Conteúdo Exclusivo",
  description: "Conteúdo exclusivo para maiores de 18 anos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#080808] text-white">
        <AuthProvider>
          <ConditionalNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
