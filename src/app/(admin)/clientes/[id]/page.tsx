type PageProps = { params: { id: string } };

export default function ClienteDetalhe({ params }: PageProps) {
  return (
    <div>
      <h1>Cliente #{params.id}</h1>
    </div>
  );
}
