import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Crown, Lock, Play, Eye, Flame, ChevronDown } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080808] overflow-x-hidden">

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Creator photo — atmospheric */}
        <Image
          src="/creator.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top scale-110 hero-bg-image"
        />

        {/* Multi-layer overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/60 to-[#080808]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_70%_40%,_rgba(245,196,0,0.06)_0%,_transparent_70%)]" />

        {/* Ambient glows */}
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#F5C400]/4 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#F5C400]/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full py-32 flex flex-col lg:flex-row items-center gap-16">

          {/* Left — Text */}
          <div className="flex-1 max-w-2xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F5C400]/10 border border-[#F5C400]/25 rounded-full px-4 py-1.5 mb-8">
              <Crown size={13} className="text-[#F5C400]" />
              <span className="text-[#F5C400] text-xs font-semibold tracking-widest uppercase">Conteúdo +18 Exclusivo</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] mb-6 tracking-tight">
              <span className="text-white">Queen</span>
              <br />
              <span className="text-[#F5C400]">Rayalla</span>
            </h1>

            {/* Tagline */}
            <p className="text-zinc-300 text-xl sm:text-2xl font-light leading-relaxed mb-4">
              Eu sei exatamente o que você{" "}
              <span className="text-white font-semibold italic">veio buscar aqui.</span>
            </p>
            <p className="text-zinc-500 text-base leading-relaxed mb-10 max-w-lg">
              Fotos e vídeos que eu fiz pensando em você. Tudo que eu faço em segredo, tudo que fico com vontade de mostrar. Só pra quem tiver coragem de entrar.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto min-w-[220px] text-base shadow-[0_0_40px_rgba(245,196,0,0.25)]">
                  <Flame size={16} className="mr-2" />
                  Quero ver tudo agora
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[180px] text-base border-white/15">
                  Já sou assinante
                </Button>
              </Link>
            </div>

            {/* Trust line */}
            <p className="text-zinc-600 text-xs">
              Cancele quando quiser · Pagamento seguro · +18 apenas
            </p>
          </div>

          {/* Right — Teaser cards */}
          <div className="hidden lg:flex flex-col gap-3 w-72 shrink-0">
            {/* Locked preview cards */}
            {[
              { label: "Novo", tag: "Me filmei toda" },
              { label: "Premium", tag: "Só de calcinha" },
              { label: "Hot", tag: "Pede pra ver..." },
            ].map((item) => (
              <div
                key={item.tag}
                className="relative h-36 bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden group cursor-pointer hover:border-[#F5C400]/30 transition-all duration-300"
              >
                {/* Blurred placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/60 to-zinc-900/80" />
                <Image
                  src="/creator.jpg"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="288px"
                  className="object-cover object-top blur-xl scale-110 opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                />

                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-black/60 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Lock size={16} className="text-[#F5C400]" />
                  </div>
                  <span className="text-white text-xs font-medium">{item.tag}</span>
                </div>

                {/* Tag badge */}
                <div className="absolute top-2.5 left-2.5 bg-[#F5C400] text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  {item.label}
                </div>
              </div>
            ))}

            <p className="text-center text-zinc-600 text-xs mt-1">
              <Lock size={10} className="inline mr-1" />
              Desbloqueie todo o conteúdo
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
          <ChevronDown size={20} className="text-[#F5C400]" />
        </div>
      </section>

      {/* ═══════════════════════════════ STATS ═══════════════════════════════ */}
      <section className="relative py-14 border-y border-white/[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,196,0,0.03)_0%,_transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { value: "500+", label: "Fotos exclusivas", sub: "alta resolução" },
            { value: "100+", label: "Vídeos íntimos", sub: "nunca antes vistos" },
            { value: "Novo", label: "Todo semana", sub: "conteúdo fresco" },
          ].map((item) => (
            <div key={item.label} className="group">
              <div className="text-4xl sm:text-5xl font-black text-[#F5C400] mb-1 group-hover:scale-105 transition-transform duration-200">
                {item.value}
              </div>
              <div className="text-white text-sm font-semibold mb-0.5">{item.label}</div>
              <div className="text-zinc-600 text-xs">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════ TEASER GRID ═══════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-[#F5C400] text-xs font-bold tracking-[0.3em] uppercase mb-3">Fica com vontade</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Tem muita coisa guardada aqui
            </h2>
            <p className="text-zinc-500 text-base max-w-md mx-auto">
              Eu sei que você quer ver. Assina e eu mostro tudo, sem vergonha nenhuma.
            </p>
          </div>

          {/* Grid of blurred preview tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
            {[
              { type: "photo", label: "Fui pra piscina sem sutiã", tag: "Novo" },
              { type: "video", label: "Me filmei no banheiro", tag: "Hot" },
              { type: "photo", label: "Só calcinha e nada mais", tag: "Hot" },
              { type: "video", label: "Gravei tudo pra você", tag: "Premium" },
              { type: "photo", label: "No quarto com pouca roupa", tag: "Novo" },
              { type: "photo", label: "Ensaio de madrugada", tag: "Hot" },
              { type: "video", label: "O que eu faço sozinha", tag: "Premium" },
              { type: "photo", label: "Você não tá pronto...", tag: "?" },
            ].map((item, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] bg-zinc-900 rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer"
              >
                {/* Blurred creator image */}
                <Image
                  src="/creator.jpg"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-top blur-2xl scale-125 opacity-50"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/70 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:border-[#F5C400]/50 group-hover:scale-110 transition-all duration-300">
                    {item.type === "video"
                      ? <Play size={16} className="text-[#F5C400] ml-0.5" />
                      : <Eye size={16} className="text-[#F5C400]" />
                    }
                  </div>
                </div>

                {/* Tag */}
                {item.tag !== "?" && (
                  <div className="absolute top-2.5 left-2.5 bg-[#F5C400] text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                    {item.tag}
                  </div>
                )}

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-white text-xs font-medium truncate">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/register">
              <Button size="lg" className="shadow-[0_0_50px_rgba(245,196,0,0.2)]">
                <Lock size={15} className="mr-2" />
                Desbloquear todo o conteúdo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ WHY SUBSCRIBE ═══════════════════════════════ */}
      <section className="py-20 px-6 bg-white/[0.015] border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Por que assinar?
            </h2>
            <p className="text-zinc-500">Porque você já ficou olhando pra capa e não aguentou. Agora entra logo.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                emoji: "🔥",
                title: "Eu não tenho vergonha",
                desc: "Faço tudo que tenho vontade e mostro aqui. Sem filtro, sem corte, sem censura.",
              },
              {
                emoji: "💎",
                title: "Tem muito guardado",
                desc: "Mais de 600 fotos e vídeos te esperando. Tudo liberado assim que você assinar.",
              },
              {
                emoji: "🔒",
                title: "Só entre nós",
                desc: "Ninguém vai saber que você assinou. Discreta na fatura, segura nos dados.",
              },
              {
                emoji: "⚡",
                title: "Toda semana tem mais",
                desc: "Eu não paro. Toda semana tem conteúdo novo pra você ficar com mais vontade.",
              },
              {
                emoji: "👑",
                title: "Sou eu de verdade",
                desc: "Não é personagem. Sou eu sendo safada do jeito que gosto, sem precisar fingir.",
              },
              {
                emoji: "✂️",
                title: "Você manda",
                desc: "Cancela quando quiser. Sem pergunta, sem drama. Mas vai que você se arrepende.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/[0.025] border border-white/6 rounded-2xl p-6 hover:border-[#F5C400]/20 hover:bg-white/[0.04] transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-white text-base mb-2 group-hover:text-[#F5C400] transition-colors">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ PRICING ═══════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-md mx-auto">

          <div className="text-center mb-10">
            <p className="text-[#F5C400] text-xs font-bold tracking-[0.3em] uppercase mb-3">Plano de acesso</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Um preço. Eu toda liberada.
            </h2>
          </div>

          <div className="relative bg-white/3 border border-[#F5C400]/25 rounded-3xl p-8 text-center overflow-hidden glow-gold">
            {/* Top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#F5C400]/70 to-transparent" />
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#F5C400]/5 blur-3xl pointer-events-none" />

            <div className="relative">
              {/* Popular badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#F5C400] text-black text-xs font-black px-3 py-1 rounded-full mb-6">
                <Crown size={11} />
                ACESSO TOTAL
              </div>

              {/* Price */}
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-zinc-400 text-xl mb-2">R$</span>
                <span className="text-7xl font-black text-white leading-none">29</span>
                <span className="text-zinc-400 text-3xl mb-2">,90</span>
              </div>
              <p className="text-zinc-500 text-sm mb-8">por mês · renovação automática · cancele quando quiser</p>

              {/* Features */}
              <ul className="space-y-3 mb-8 text-left">
                {[
                  "Acesso a tudo que eu faço e escondo",
                  "500+ fotos sem roupa nem vergonha",
                  "100+ vídeos que eu fiz pensando em você",
                  "Conteúdo novo toda semana sem falta",
                  "Cancela quando quiser sem burocracia",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                    <span className="w-5 h-5 bg-[#F5C400]/15 border border-[#F5C400]/30 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[#F5C400] text-xs font-bold">✓</span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button size="lg" className="w-full text-base shadow-[0_0_50px_rgba(245,196,0,0.3)]">
                  <Flame size={16} className="mr-2" />
                  Assinar agora
                </Button>
              </Link>

              <p className="text-zinc-700 text-xs mt-4">
                Pagamento seguro · Renovação mensal · Discreta na fatura
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ FINAL CTA ═══════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        {/* Background */}
        <Image
          src="/creator.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-top hero-bg-image"
        />
        <div className="absolute inset-0 bg-[#080808]/88" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,196,0,0.08)_0%,_transparent_65%)]" />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <Crown size={32} className="text-[#F5C400] mx-auto mb-5 opacity-80" />
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Você ficou até aqui.{" "}
            <span className="text-[#F5C400]">Já tá com vontade.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
            Eu sei que você quer ver mais. Entra logo que eu mostro tudo que tenho guardado. Por R$29,90 por mês você acessa eu inteira.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base min-w-[240px] shadow-[0_0_60px_rgba(245,196,0,0.3)]">
              Entra e me vê toda por R$29,90
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#F5C400]/10 border border-[#F5C400]/30 rounded-lg flex items-center justify-center">
              <Crown size={13} className="text-[#F5C400]" />
            </div>
            <span className="font-black text-sm">
              <span className="text-white">Queen </span>
              <span className="text-[#F5C400]">Rayalla</span>
            </span>
          </div>
          <p className="text-zinc-700 text-xs mb-1">
            Este site contém conteúdo adulto (+18). Ao acessar, você confirma que é maior de idade.
          </p>
          <p className="text-zinc-800 text-xs">
            © {new Date().getFullYear()} Queen Rayalla. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}
