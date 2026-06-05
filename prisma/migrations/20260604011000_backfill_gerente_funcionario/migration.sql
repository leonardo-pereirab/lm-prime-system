-- Backfill de compatibilidade:
-- garante que usuários ADMIN legados também existam como funcionários GERENTE.

WITH admins_sem_funcionario AS (
    SELECT
        u."id",
        u."nome",
        u."email",
        u."ativo",
        ROW_NUMBER() OVER (ORDER BY u."createdAt", u."id") AS rn
    FROM "usuarios" u
    LEFT JOIN "funcionarios" f ON f."usuarioId" = u."id"
    WHERE u."perfil" = 'ADMIN'
      AND f."id" IS NULL
)
INSERT INTO "funcionarios" (
    "id",
    "usuarioId",
    "estado",
    "classificacao",
    "matricula",
    "nomeCompleto",
    "emailCorporativo",
    "cpf",
    "telefonePrincipal",
    "cep",
    "logradouro",
    "numero",
    "bairro",
    "cidade",
    "estadoUf",
    "createdAt",
    "updatedAt"
)
SELECT
    'func_' || SUBSTRING(REPLACE(a."id", '-', '') FROM 1 FOR 20),
    a."id",
    CASE
        WHEN a."ativo" THEN 'ATIVO'::"EstadoFuncionario"
        ELSE 'INATIVO'::"EstadoFuncionario"
    END,
    'GERENTE'::"ClassificacaoFuncionario",
    'GER-' || LPAD((a.rn + 10000)::TEXT, 5, '0'),
    a."nome",
    a."email",
    (90000000000 + a.rn)::TEXT,
    '11999999999',
    '00000000',
    'Nao informado',
    'S/N',
    'Nao informado',
    'Nao informado',
    'SP',
    NOW(),
    NOW()
FROM admins_sem_funcionario a;