import Link from "next/link";

export const metadata = {
  title: "Termos e politicas de seguranca | LM Prime System",
};

export default function TermosPoliticasSegurancaPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">
          Termos e politicas de seguranca
        </h1>
        <p className="text-sm text-neutral-600">
          Documento de referencia para uso interno do sistema, tratamento de
          dados e responsabilidade de acesso.
        </p>
      </header>

      <section className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            1. Uso de credenciais
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O acesso e individual e intransferivel. A credencial vinculada ao
            funcionario deve ser usada apenas para atividades da LM Prime.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            2. Perfil e classificação
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O perfil técnico é definido pela classificação do funcionário e pode
            ser alterado somente por gerente autorizado.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            3. Tratamento de dados pessoais
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Dados de clientes, motoristas, parceiros e atendimentos sao tratados
            para execucao operacional, rastreabilidade e obrigacoes contratuais.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            4. Guarda e rastreabilidade
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Registros de fluxo são mantidos para auditoria e histórico
            operacional. Quando necessario, aplicamos anonimização conforme
            regras internas.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            5. Incidentes e suporte
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Qualquer uso indevido, suspeita de acesso indevido ou incidente deve
            ser reportado imediatamente ao gestor responsavel.
          </p>
        </div>
      </section>

      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          Voltar para login
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          Ir para início
        </Link>
      </div>
    </main>
  );
}
