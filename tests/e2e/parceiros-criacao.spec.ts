import { expect, test } from "@playwright/test";
import { autenticarSessaoE2E } from "./helpers/authSession";

function gerarCnpjValido(): string {
  const base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));

  const calcularDigito = (digitos: number[], pesos: number[]) => {
    const soma = digitos.reduce(
      (acumulado, digito, indice) => acumulado + digito * pesos[indice],
      0,
    );
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcularDigito(
    [...base, d1],
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return [...base, d1, d2].join("");
}

test("cria parceiro pela interface", async ({ page }) => {
  await autenticarSessaoE2E(page);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/cadastros/parceiros");
  await page.getByRole("link", { name: "Novo parceiro" }).click();
  await expect(page).toHaveURL(/\/cadastros\/parceiros\/novo$/);

  const nome = `Parceiro E2E ${Date.now()}`;
  const cnpj = gerarCnpjValido();

  await page.getByLabel("Nome da empresa").fill(nome);
  await page.getByLabel("Nome da empresa").press("Tab");
  await page.getByLabel("CNPJ").fill(cnpj);
  await page.getByLabel("CNPJ").press("Tab");
  await page.getByLabel("Telefone").fill("11999998888");
  await page.getByLabel("Telefone").press("Tab");
  await page.getByLabel("E-mail").fill(`parceiro${Date.now()}@lmprime.local`);
  await page.getByLabel("E-mail").press("Tab");

  await page.getByRole("button", { name: "Cadastrar parceiro" }).click();

  await expect(page).toHaveURL(/\/cadastros\/parceiros\/(?!novo$).+$/, {
    timeout: 15_000,
  });
  await expect(page.getByRole("heading", { name: nome })).toBeVisible({
    timeout: 20_000,
  });
});
