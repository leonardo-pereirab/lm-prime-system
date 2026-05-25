import { unstable_cache } from "next/cache";

export type EnderecoCep = {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

function normalizarCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

async function consultarCepInternal(
  cepLimpo: string,
): Promise<EnderecoCep | null> {
  if (cepLimpo.length !== 8) return null;

  const baseUrl = process.env.VIACEP_BASE_URL ?? "https://viacep.com.br/ws";
  const res = await fetch(`${baseUrl}/${cepLimpo}/json/`);
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
    estado: data.uf,
    cep: data.cep,
  };
}

const consultarCepCacheado = unstable_cache(consultarCepInternal, ["viacep"], {
  revalidate: 60 * 60 * 24,
  tags: ["cep"],
});

export async function consultarCep(cep: string): Promise<EnderecoCep | null> {
  const cepLimpo = normalizarCep(cep);
  if (cepLimpo.length !== 8) return null;

  try {
    return await consultarCepCacheado(cepLimpo);
  } catch {
    return consultarCepInternal(cepLimpo);
  }
}

export async function buscarEnderecoPorCep(
  cep: string,
): Promise<EnderecoCep | null> {
  return consultarCep(cep);
}
