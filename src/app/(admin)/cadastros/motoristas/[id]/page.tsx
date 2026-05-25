import MotoristaDetalhe from "@/app/(admin)/cadastros/motoristas/_components/MotoristaDetalhe";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ editar?: string }>;
};

export default async function MotoristaDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;

  return <MotoristaDetalhe id={id} iniciarEmEdicao={query?.editar === "1"} />;
}
