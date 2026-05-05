type EnderecoCep = {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

export async function buscarEnderecoPorCep(
  cep: string,
): Promise<EnderecoCep | null> {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  if (!res.ok) return null;

  const data: {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    cep?: string;
  } = await res.json();
  if (data.erro) return null;

  if (
    !data.logradouro ||
    !data.bairro ||
    !data.localidade ||
    !data.uf ||
    !data.cep
  )
    return null;

  return {
    logradouro: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    uf: data.uf,
    cep: data.cep,
  };
}
