# Testes de integracao de repositories

Estes testes usam Prisma com banco real de teste.

Ordem de resolucao da conexao:

1. `DATABASE_URL_TEST`
2. `DATABASE_URL`

Recomendacao da fase 07:

- Usar um banco dedicado de testes (Supabase projeto separado ou Postgres efemero).
- Nunca apontar para producao.
