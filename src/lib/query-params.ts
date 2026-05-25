export function parsePagination(searchParams: URLSearchParams) {
  const paginaRaw = Number(searchParams.get("pagina") ?? "1");
  const tamanhoRaw = Number(searchParams.get("tamanho") ?? "20");

  const pagina = Number.isFinite(paginaRaw) && paginaRaw > 0 ? paginaRaw : 1;
  const tamanho =
    Number.isFinite(tamanhoRaw) && tamanhoRaw > 0 && tamanhoRaw <= 100
      ? tamanhoRaw
      : 20;

  return { pagina, tamanho };
}

export function parseBoolean(value: string | null, defaultValue: boolean) {
  if (value === null) {
    return defaultValue;
  }

  return ["1", "true", "sim", "yes"].includes(value.toLowerCase());
}

export function parseDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
