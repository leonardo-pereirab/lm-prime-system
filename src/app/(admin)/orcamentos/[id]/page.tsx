type PageProps = { params: Promise<{ id: string }> };

export default async function OrcamentoDetalhePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Orçamento #{id}</h1>
    </div>
  );
}
