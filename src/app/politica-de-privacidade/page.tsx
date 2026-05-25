import Link from "next/link";

export const metadata = {
  title: "Politica de privacidade | LM Prime System",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">
          Politica de privacidade
        </h1>
        <p className="text-sm text-neutral-600">
          Esta pagina descreve como o LM Prime System trata dados pessoais no
          contexto operacional da empresa.
        </p>
      </header>

      <section className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            Quais dados coletamos e por que
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Coletamos dados de identificacao e contato de clientes, motoristas,
            parceiros e atendimentos para registrar solicitacoes, emitir
            orcamentos, organizar escalas e formalizar contratos de prestacao de
            servico.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            Tempo de armazenamento
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Os dados sao mantidos enquanto houver necessidade operacional,
            contratual e de rastreabilidade dos atendimentos, observando os
            prazos internos aplicaveis ao negocio.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            Quem tem acesso
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O acesso aos dados e restrito a usuarios administradores autorizados
            para operar o sistema da LM Prime.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            Solicitacao de remocao
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Solicite remocao de dados pelo e-mail manual de atendimento:
            admin@lmprime.com.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          Voltar para o inicio
        </Link>
      </div>
    </main>
  );
}
