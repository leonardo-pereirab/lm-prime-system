type PageProps = { params: { id: string } };

export default function AtendimentoDetalhe({ params }: PageProps) {
  return (
    <div>
      <h1>Atendimento #{params.id}</h1>
    </div>
  );
}
