import ClienteDetalhe from "@/app/(admin)/clientes/_components/ClienteDetalhe";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ editar?: string }>;
};

export default async function ClienteDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;

  return <ClienteDetalhe id={id} iniciarEmEdicao={query?.editar === "1"} />;
}
