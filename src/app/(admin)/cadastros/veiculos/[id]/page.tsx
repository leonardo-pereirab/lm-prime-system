import VeiculoDetalhe from "@/app/(admin)/cadastros/veiculos/_components/VeiculoDetalhe";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ editar?: string }>;
};

export default async function VeiculoDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;

  return <VeiculoDetalhe id={id} iniciarEmEdicao={query?.editar === "1"} />;
}
