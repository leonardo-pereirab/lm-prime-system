type PageProps = { params: { id: string } };

export default function UsuarioDetalhePage({ params }: PageProps) {
  return (
    <div>
      <h1>Usuario #{params.id}</h1>
    </div>
  );
}
