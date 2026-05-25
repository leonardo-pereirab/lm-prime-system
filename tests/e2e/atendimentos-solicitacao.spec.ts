import { expect, test } from "@playwright/test";
import { autenticarSessaoE2E } from "./helpers/authSession";

test("cria solicitacao, edita e avanca para orcamento", async ({ page }) => {
  await autenticarSessaoE2E(page);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/atendimentos/novo");

  await page.getByLabel("Nome do lead").fill(`Lead E2E ${Date.now()}`);
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
  await expect(
    page.getByRole("heading", { name: "Solicitacao" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Observacoes").fill("Atualizacao e2e");
  await page.getByRole("button", { name: "Salvar" }).first().click();
  await page
    .getByRole("button", { name: "Salvar", exact: true })
    .last()
    .click();

  await page.getByRole("button", { name: "Ir para orcamento" }).click();
  await page
    .getByRole("button", { name: "Ir para orcamento", exact: true })
    .last()
    .click();

  await expect(page).toHaveURL(/\/atendimentos\/[^/]+\/orcamento$/);
});
