import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ConditionalNav from "@/components/ConditionalNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import ReactQueryProvider from "@/lib/query-client";

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
    <html
      lang="pt-BR"
      className={`${geist.variable} h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="min-h-full text-white" suppressHydrationWarning>
        <ReactQueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <ServiceWorkerRegistrar />
              <ConditionalNav />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
