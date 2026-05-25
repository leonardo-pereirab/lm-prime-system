import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-5 py-4 shadow-sm">
        <Loader2 className="size-4 animate-spin text-primary-700" />
        <p className="text-sm text-neutral-700">Carregando...</p>
      </div>
    </main>
  );
}
