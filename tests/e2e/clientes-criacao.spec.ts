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

test("cria cliente pela interface", async ({ page }) => {
  await autenticarSessaoE2E(page);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/clientes");
  await page.getByRole("link", { name: "Novo cliente" }).click();
  await expect(page).toHaveURL(/\/clientes\/novo$/);

  const nome = `Cliente E2E ${Date.now()}`;
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("CPF/CNPJ").fill(gerarCpfValido());
  await page.getByLabel("Telefone principal").fill("11999998888");

  await page.getByRole("button", { name: "Cadastrar cliente" }).click();

  // O padrão exclui /novo para não casar com a URL atual antes da navegação
  await expect(page).toHaveURL(/\/clientes\/(?!novo$).+$/, { timeout: 15_000 });

  // Aguarda o fetch assíncrono do TanStack Query completar antes de verificar o heading
  await expect(page.getByRole("heading", { name: nome })).toBeVisible({
    timeout: 20_000,
  });
});
