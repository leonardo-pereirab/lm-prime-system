type PageProps = { params: { id: string } };

export default function MotoristaDetalhePage({ params }: PageProps) {
  return (
    <div>
      <h1>Motorista #{params.id}</h1>
    </div>
  );
}
