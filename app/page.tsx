import Link from "next/link";
import Button from "@/components/ui/Button";
import { Lock, Star, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
            Conteúdo exclusivo +18
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Conteúdo{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">
              exclusivo
            </span>{" "}
            te aguarda
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Acesse fotos e vídeos premium com uma assinatura mensal. Conteúdo novo toda semana,
            com qualidade profissional e total privacidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Começar agora — R$ 29,90/mês
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Já tenho conta
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-zinc-500">
            Ao se cadastrar, você confirma que tem 18 anos ou mais
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Por que assinar?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Star className="text-rose-400" size={28} />,
                title: "Conteúdo Premium",
                desc: "Fotos e vídeos exclusivos de alta qualidade atualizados semanalmente.",
              },
              {
                icon: <Lock className="text-rose-400" size={28} />,
                title: "Acesso Privado",
                desc: "Conteúdo protegido. Apenas assinantes têm acesso completo.",
              },
              {
                icon: <Shield className="text-rose-400" size={28} />,
                title: "Seguro e Discreto",
                desc: "Pagamento seguro via Stripe. Sua privacidade é nossa prioridade.",
              },
              {
                icon: <Zap className="text-rose-400" size={28} />,
                title: "Acesso Imediato",
                desc: "Após o pagamento, acesse todo o conteúdo instantaneamente.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-rose-800/50 transition-colors"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Um plano simples</h2>
          <p className="text-zinc-400 mb-10">Sem surpresas. Cancele quando quiser.</p>

          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-rose-800/40 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-rose-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              MAIS POPULAR
            </div>
            <div className="text-5xl font-bold text-white mb-1">R$ 29,90</div>
            <div className="text-zinc-400 mb-8">por mês</div>
            <ul className="text-left space-y-3 mb-8">
              {[
                "Acesso a todo o conteúdo",
                "Novas publicações semanais",
                "Fotos e vídeos HD",
                "Cancele quando quiser",
                "Suporte prioritário",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-zinc-300">
                  <span className="text-rose-500">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/register">
              <Button size="lg" className="w-full">
                Assinar agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
        <p>
          Este site contém conteúdo adulto (18+). Ao acessar, você confirma que é maior de idade.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} ContentHub. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
