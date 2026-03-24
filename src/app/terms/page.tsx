import Link from "next/link";

export const metadata = { title: "Termos de Uso — Queen Rayalla" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-zinc-300">
      <h1 className="text-3xl font-black text-white mb-2">Termos de Uso</h1>
      <p className="text-zinc-500 text-sm mb-8">Última atualização: março de 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-white font-bold text-lg mb-2">1. Aceitação dos termos</h2>
          <p>Ao criar uma conta e acessar a plataforma Queen Rayalla, você declara ter lido, compreendido e concordado com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não utilize a plataforma.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">2. Restrição de idade</h2>
          <p>Esta plataforma contém conteúdo adulto explícito. O acesso é <strong className="text-white">estritamente proibido para menores de 18 anos</strong>. Ao se cadastrar, você declara sob responsabilidade que tem 18 anos ou mais. O cadastro com informações falsas sobre a idade pode resultar em responsabilidade civil e/ou criminal.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">3. Conta e assinatura</h2>
          <p>Você é responsável por manter a confidencialidade de suas credenciais. A assinatura é pessoal e intransferível. O compartilhamento de acesso é proibido e pode resultar no cancelamento imediato da conta sem reembolso.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">4. Conteúdo</h2>
          <p>Todo o conteúdo disponibilizado na plataforma é protegido por direitos autorais. É expressamente proibido copiar, redistribuir, fazer download não autorizado, compartilhar ou reproduzir qualquer conteúdo da plataforma sem autorização escrita prévia. Violações serão tratadas com rigor legal.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">5. Pagamentos e reembolsos</h2>
          <p>As cobranças são processadas de forma segura via Stripe. As assinaturas são renovadas automaticamente no período contratado. Cancelamentos podem ser feitos a qualquer momento pelo portal do assinante, com efeito ao fim do período vigente. Não há reembolso proporcional por cancelamento antecipado.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">6. Cancelamento e suspensão</h2>
          <p>Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio e sem reembolso.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">7. Limitação de responsabilidade</h2>
          <p>A plataforma é fornecida "como está". Não nos responsabilizamos por danos indiretos, incidentais ou consequentes decorrentes do uso ou impossibilidade de uso da plataforma.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">8. Alterações nos termos</h2>
          <p>Podemos atualizar estes Termos a qualquer momento. O uso continuado da plataforma após as alterações implica na aceitação dos novos termos.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">9. Contato</h2>
          <p>Dúvidas sobre estes termos: <span className="text-[#F5C400]">contato@queenrayalla.com</span></p>
        </div>
      </section>

      <div className="mt-10 pt-6 border-t border-white/10 flex gap-4 text-sm">
        <Link href="/privacy" className="text-zinc-500 hover:text-[#F5C400] transition-colors">Política de Privacidade</Link>
        <Link href="/login" className="text-zinc-500 hover:text-[#F5C400] transition-colors">Voltar ao login</Link>
      </div>
    </div>
  );
}
