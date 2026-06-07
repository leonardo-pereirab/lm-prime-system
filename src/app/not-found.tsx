import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          O endereço informado não existe ou foi movido.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button type="button" asChild>
            <Link href="/dashboard">Ir para o painel</Link>
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/login">Ir para o login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
