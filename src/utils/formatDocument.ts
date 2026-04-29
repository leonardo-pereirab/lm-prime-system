export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatDocument(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) return formatCPF(digits);
  return formatCNPJ(digits);
}
