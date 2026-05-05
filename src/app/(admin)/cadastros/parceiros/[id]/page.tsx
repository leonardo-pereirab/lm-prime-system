type PageProps = { params: { id: string } };

export default function ParceiroDetalhePage({ params }: PageProps) {
  return (
    <div>
      <h1>Parceiro #{params.id}</h1>
    </div>
  );
}
