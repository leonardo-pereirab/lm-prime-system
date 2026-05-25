type PageProps = { params: Promise<{ id: string }> };

export default async function UsuarioDetalhePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Usuario #{id}</h1>
    </div>
  );
}
