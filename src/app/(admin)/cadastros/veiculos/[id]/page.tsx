type PageProps = { params: { id: string } };

export default function VeiculoDetalhePage({ params }: PageProps) {
  return (
    <div>
      <h1>Veiculo #{params.id}</h1>
    </div>
  );
}
