import { formatarCpfCnpj as formatarDocumento } from "@/domain/helpers";
import { formatarTelefone as formatarTelefoneDominio } from "@/domain/helpers";

type ValorMoeda = number | { toNumber: () => number };

function normalizarData(data: Date | string): Date | null {
  const valor = data instanceof Date ? data : new Date(data);
  return Number.isNaN(valor.getTime()) ? null : valor;
}

export function formatarMoeda(valor: ValorMoeda): string {
  const numero = typeof valor === "number" ? valor : valor.toNumber();

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
    .format(numero)
    .replace(/\u00A0/g, " ");
}

export function formatarData(data: Date | string): string {
  const valor = normalizarData(data);
  if (!valor) return "";

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(valor);
}

export function formatarDataHora(data: Date | string): string {
  const valor = normalizarData(data);
  if (!valor) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valor);
}

export function formatarTelefoneBr(telefone: string): string {
  return formatarTelefoneDominio(telefone);
}

export function formatarCpfCnpj(documento: string): string {
  return formatarDocumento(documento);
}
