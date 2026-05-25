import { expect, test, type Page } from "@playwright/test";
import { autenticarSessaoE2E } from "./helpers/authSession";

async function login(page: Page) {
  await autenticarSessaoE2E(page);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function criarAtendimentoAteOrcamento(page: Page, sufixo: string) {
  await page.goto("/atendimentos/novo");

  await page.getByLabel("Nome do lead").fill(`Lead Orcamento ${sufixo}`);
  await page.getByLabel("Telefone do lead").fill("11999998888");
  await page.getByLabel("Local de saida").first().fill("Sao Paulo");
  await page.getByLabel("Destino").first().fill("Campinas");
  await page.getByLabel("Quantidade de passageiros").fill("4");
  await page.getByLabel("Data do servico").fill("25/12/2026");

  await page.getByRole("button", { name: "Salvar" }).first().click();
  await page
    .getByRole("button", { name: "Salvar", exact: true })
    .last()
    .click();

  await expect(page).toHaveURL(/\/atendimentos\/[^/]+\/solicitacao$/);

  await page.getByRole("button", { name: "Ir para orcamento" }).click();
  await page
    .getByRole("button", { name: "Ir para orcamento", exact: true })
    .last()
    .click();

  await expect(page).toHaveURL(/\/atendimentos\/[^/]+\/orcamento$/);
}

async function preencherEConfirmarOrcamento(page: Page) {
  await page.getByLabel("Valor total").fill("250000");
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Pix" }).click();
  await page.getByLabel("Data de vencimento").fill("31/12/2026");
  await page.getByLabel("Observacoes").fill("Orcamento criado no smoke e2e");

  await page.getByRole("button", { name: "Salvar" }).first().click();
  await page
    .getByRole("button", { name: "Salvar", exact: true })
    .last()
    .click();

  await expect(page.getByText(/Valido por/i)).toBeVisible();
}

test("fluxo da etapa de orcamento: salvar, cancelar e avancar para reserva", async ({
  page,
}) => {
  await login(page);

  await criarAtendimentoAteOrcamento(page, `${Date.now()}-cancelar`);
  await preencherEConfirmarOrcamento(page);

  await page.getByRole("button", { name: "Cancelar orcamento" }).click();
  await page.getByRole("button", { name: "Confirmar" }).last().click();

  await expect(page.getByText("Orcamento cancelado")).toBeVisible();

  await criarAtendimentoAteOrcamento(page, `${Date.now()}-reserva`);
  await preencherEConfirmarOrcamento(page);

  await page.getByRole("button", { name: "Ir para reserva" }).click();
  await page.getByRole("button", { name: "Ir para reserva" }).last().click();

  await expect(page).toHaveURL(/\/atendimentos\/[^/]+\/reserva$/);
});
