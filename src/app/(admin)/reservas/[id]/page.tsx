type PageProps = { params: Promise<{ id: string }> };

export default async function ReservaDetalhePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Reserva #{id}</h1>
    </div>
  );
}
