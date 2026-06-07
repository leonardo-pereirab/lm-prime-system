"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">
          Ocorreu um erro inesperado
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Não foi possível carregar esta página agora. Tente novamente.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button type="button" onClick={reset}>
            Tentar novamente
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
