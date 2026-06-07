import Link from "next/link";
import AtivacaoContaForm from "@/components/forms/AtivacaoContaForm";

export const metadata = {
  title: "Ativação de conta — LM Prime System",
};

export default function AtivacaoContaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-semibold text-primary-700">
            Ativação de conta
          </h1>
          <p className="text-sm text-neutral-500">
            Valide seus dados para concluir o primeiro acesso.
          </p>
        </div>

        <AtivacaoContaForm />

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
