import { expect, test } from "@playwright/test";
import { autenticarSessaoE2E } from "./helpers/authSession";

function gerarCpfValido(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));

  const calcularDigito = (digitos: number[], pesoInicial: number) => {
    const soma = digitos.reduce(
      (acumulado, digito, indice) =>
        acumulado + digito * (pesoInicial - indice),
      0,
    );
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcularDigito(base, 10);
  const d2 = calcularDigito([...base, d1], 11);

  return [...base, d1, d2].join("");
}

test("cria motorista pela interface", async ({ page }) => {
  await autenticarSessaoE2E(page);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/cadastros/motoristas");
  await page.getByRole("link", { name: "Novo motorista" }).click();
  await expect(page).toHaveURL(/\/cadastros\/motoristas\/novo$/);

  const nome = `Motorista E2E ${Date.now()}`;
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("CPF").fill(gerarCpfValido());
  await page.getByLabel("Telefone").fill("11999998888");
  await page.getByLabel("Numero da CNH").fill(`CNH${Date.now()}`);
  await page.getByRole("combobox", { name: "Categoria" }).click();
  await page.getByRole("option", { name: "B" }).click();
  await page.getByLabel("Validade da CNH").fill("31/12/2027");

  await page.getByRole("button", { name: "Cadastrar motorista" }).click();

  await expect(page).toHaveURL(/\/cadastros\/motoristas\/(?!novo$).+$/, {
    timeout: 15_000,
  });
  await expect(page.getByRole("heading", { name: nome })).toBeVisible({
    timeout: 20_000,
  });
});
