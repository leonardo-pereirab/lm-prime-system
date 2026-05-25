export function gerarCodigoAtendimento(ano: number, sequencia: number): string {
  return `ATD-${ano}-${String(sequencia).padStart(5, "0")}`;
}

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function validarCpf(cpf: string): boolean {
  const cpfLimpo = apenasDigitos(cpf);
  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) {
    soma += Number(cpfLimpo[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpfLimpo[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) {
    soma += Number(cpfLimpo[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === Number(cpfLimpo[10]);
}

export function validarCnpj(cnpj: string): boolean {
  const cnpjLimpo = apenasDigitos(cnpj);
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

  const pesosPrimeiroDigito = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesosSegundoDigito = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let soma = 0;
  for (let i = 0; i < 12; i += 1) {
    soma += Number(cnpjLimpo[i]) * pesosPrimeiroDigito[i];
  }
  let resto = soma % 11;
  const primeiroDigito = resto < 2 ? 0 : 11 - resto;
  if (primeiroDigito !== Number(cnpjLimpo[12])) return false;

  soma = 0;
  for (let i = 0; i < 13; i += 1) {
    soma += Number(cnpjLimpo[i]) * pesosSegundoDigito[i];
  }
  resto = soma % 11;
  const segundoDigito = resto < 2 ? 0 : 11 - resto;

  return segundoDigito === Number(cnpjLimpo[13]);
}

export function validarCpfCnpj(documento: string): boolean {
  const documentoLimpo = apenasDigitos(documento);

  if (documentoLimpo.length === 11) {
    return validarCpf(documentoLimpo);
  }

  if (documentoLimpo.length === 14) {
    return validarCnpj(documentoLimpo);
  }

  return false;
}

export function formatarCpfCnpj(documento: string): string {
  const documentoLimpo = apenasDigitos(documento);

  if (documentoLimpo.length === 11) {
    return documentoLimpo.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4",
    );
  }

  if (documentoLimpo.length === 14) {
    return documentoLimpo.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
  }

  return documento;
}

export function formatarCep(cep: string): string {
  const cepLimpo = apenasDigitos(cep);
  if (cepLimpo.length !== 8) return cep;

  return cepLimpo.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = apenasDigitos(telefone);

  if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  return telefone;
}
