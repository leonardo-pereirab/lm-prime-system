import { expect, test, type Page } from "@playwright/test";
import { autenticarSessaoE2E } from "./helpers/authSession";

async function login(page: Page) {
  await autenticarSessaoE2E(page);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function criarAtendimentoAteReserva(page: Page, sufixo: string) {
  await page.goto("/atendimentos/novo");

  await page.getByLabel("Nome do lead").fill(`Lead Reserva ${sufixo}`);
  await page.getByLabel("Telefone do lead").fill("11999998888");
  await page.getByLabel("Local de saida").first().fill("Sao Paulo");
  await page.getByLabel("Destino").first().fill("Campinas");
  await page.getByLabel("Quantidade de passageiros").fill("5");
  await page.getByLabel("Data do servico").fill("25/12/2026");

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

  await page.getByLabel("Valor total").fill("350000");
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Pix" }).click();
  await page.getByRole("button", { name: "Salvar" }).first().click();
  await page
    .getByRole("button", { name: "Salvar", exact: true })
    .last()
    .click();

  await page.getByRole("button", { name: "Ir para reserva" }).click();
  await page.getByRole("button", { name: "Ir para reserva" }).last().click();

  await expect(page).toHaveURL(/\/atendimentos\/[^/]+\/reserva$/);
}

test("reserva de lead promove cliente e permite seguir para escala", async ({
  page,
}) => {
  await login(page);
  await criarAtendimentoAteReserva(page, String(Date.now()));

  await page.getByLabel("CPF/CNPJ").fill("12345678901");
  await page.getByLabel("Telefone").first().fill("11999998888");
  await page.getByLabel("CEP").fill("01001000");
  await page.getByLabel("Numero").fill("100");

  await page.getByRole("button", { name: "Confirmar reserva" }).first().click();
  await page
    .getByRole("button", { name: "Confirmar reserva", exact: true })
    .last()
    .click();

  await page.getByRole("button", { name: "Ir para escala" }).click();
  await page.getByRole("button", { name: "Ir para escala" }).last().click();

  await expect(page).toHaveURL(/\/atendimentos\/[^/]+\/escala$/);
});
