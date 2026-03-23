import Link from "next/link";

export const metadata = { title: "Política de Privacidade — Queen Rayalla" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-zinc-300">
      <h1 className="text-3xl font-black text-white mb-2">Política de Privacidade</h1>
      <p className="text-zinc-500 text-sm mb-8">Última atualização: março de 2026 — Em conformidade com a LGPD (Lei nº 13.709/2018)</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-white font-bold text-lg mb-2">1. Dados coletados</h2>
          <p>Coletamos os seguintes dados ao criar sua conta:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Data de nascimento (para verificação de maioridade)</li>
            <li>Dados de pagamento (processados pelo Stripe — não armazenamos dados de cartão)</li>
            <li>Endereço IP e logs de acesso (para segurança e prevenção de fraudes)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">2. Finalidade do tratamento</h2>
          <p>Seus dados são utilizados exclusivamente para:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li>Gerenciamento da sua conta e autenticação</li>
            <li>Processamento de pagamentos e assinaturas</li>
            <li>Comunicações sobre sua conta (ex: redefinição de senha)</li>
            <li>Cumprimento de obrigações legais</li>
            <li>Prevenção de fraudes e segurança da plataforma</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">3. Proteção dos dados</h2>
          <p>Adotamos as seguintes medidas de segurança:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li>Senhas armazenadas com hash bcrypt (fator 12) — nunca em texto puro</li>
            <li>Autenticação via tokens JWT em cookies httpOnly (não acessíveis por JavaScript)</li>
            <li>Comunicação criptografada via HTTPS/TLS em produção</li>
            <li>Acesso ao banco de dados restrito à aplicação</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">4. Compartilhamento de dados</h2>
          <p>Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li><strong className="text-white">Stripe</strong>: para processamento de pagamentos</li>
            <li>Quando exigido por lei ou ordem judicial</li>
          </ul>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">5. Seus direitos (LGPD)</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li>Confirmar a existência de tratamento dos seus dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou inexatos</li>
            <li>Solicitar a exclusão dos seus dados (direito ao esquecimento)</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p className="mt-2">Para exercer esses direitos, entre em contato: <span className="text-[#F5C400]">privacidade@queenrayalla.com</span></p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">6. Retenção de dados</h2>
          <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após o encerramento da conta, os dados são excluídos em até 90 dias, exceto quando obrigados por lei a mantê-los por período maior.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">7. Cookies</h2>
          <p>Utilizamos apenas cookies estritamente necessários para autenticação (cookie <code className="text-[#F5C400] bg-white/5 px-1 rounded">auth_token</code>, httpOnly). Não utilizamos cookies de rastreamento ou publicidade.</p>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-2">8. Contato do responsável</h2>
          <p>Encarregado de Proteção de Dados (DPO): <span className="text-[#F5C400]">privacidade@queenrayalla.com</span></p>
        </div>
      </section>

      <div className="mt-10 pt-6 border-t border-white/10 flex gap-4 text-sm">
        <Link href="/terms" className="text-zinc-500 hover:text-[#F5C400] transition-colors">Termos de Uso</Link>
        <Link href="/login" className="text-zinc-500 hover:text-[#F5C400] transition-colors">Voltar ao login</Link>
      </div>
    </div>
  );
}
