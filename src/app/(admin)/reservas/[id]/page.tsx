type PageProps = { params: { id: string } };

export default function ReservaDetalhePage({ params }: PageProps) {
  return (
    <div>
      <h1>Reserva #{params.id}</h1>
    </div>
  );
}
