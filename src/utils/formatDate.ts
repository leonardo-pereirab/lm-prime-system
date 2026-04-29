export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("pt-BR");
}
