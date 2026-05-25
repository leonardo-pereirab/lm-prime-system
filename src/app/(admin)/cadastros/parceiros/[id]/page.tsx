import ParceiroDetalhe from "@/app/(admin)/cadastros/parceiros/_components/ParceiroDetalhe";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ editar?: string }>;
};

export default async function ParceiroDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;

  return <ParceiroDetalhe id={id} iniciarEmEdicao={query?.editar === "1"} />;
}
