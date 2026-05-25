import { expect, test } from "@playwright/test";
import { autenticarSessaoE2E } from "./helpers/authSession";

function gerarPlacaValida() {
  const letras = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join("");
  const numeros = String(Math.floor(1000 + Math.random() * 9000));

  return `${letras}${numeros}`;
}

test("cria veículo pela interface", async ({ page }) => {
  await autenticarSessaoE2E(page);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/cadastros/veiculos");
  await page.getByRole("link", { name: "Novo veículo" }).click();
  await expect(page).toHaveURL(/\/cadastros\/veiculos\/novo$/);

  const modelo = `Veículo E2E ${Date.now()}`;
  const placa = gerarPlacaValida();

  await page.getByLabel("Modelo").fill(modelo);
  await page.getByLabel("Modelo").press("Tab");
  await page.getByLabel("Marca").fill("Mercedes-Benz");
  await page.getByLabel("Marca").press("Tab");
  await page.getByRole("combobox", { name: "Tipo" }).click();
  await page.getByRole("option", { name: "Van" }).click();
  await page.getByLabel("Capacidade").fill("18");
  await page.getByLabel("Capacidade").press("Tab");
  await page.getByLabel("Placa").fill(placa);
  await page.getByLabel("Placa").press("Tab");
  await page.getByLabel("Ano").fill("2024");
  await page.getByLabel("Ano").press("Tab");

  await page.getByRole("button", { name: "Cadastrar veículo" }).click();

  await expect(page).toHaveURL(/\/cadastros\/veiculos\/(?!novo$).+$/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { name: new RegExp(modelo) }),
  ).toBeVisible({
    timeout: 20_000,
  });
  await expect(
    page.getByRole("heading", { name: new RegExp(`${modelo}.*${placa}`) }),
  ).toBeVisible();
});
