type PageProps = { params: { id: string } };

export default function OrcamentoDetalhePage({ params }: PageProps) {
  return (
    <div>
      <h1>Orcamento #{params.id}</h1>
    </div>
  );
}
