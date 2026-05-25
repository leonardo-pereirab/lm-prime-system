import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "../../../tests/mocks/handlers";
import { buscarEnderecoPorCep, consultarCep } from "@/lib/cep";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("lib/cep", () => {
  it("deve consultar CEP e retornar endereco padronizado", async () => {
    const endereco = await consultarCep("01001000");

    expect(endereco).toEqual({
      cep: "01001000",
      logradouro: "Rua Exemplo",
      bairro: "Centro",
      cidade: "Sao Paulo",
      estado: "SP",
    });
  });

  it("deve retornar null para CEP invalido", async () => {
    const endereco = await consultarCep("123");

    expect(endereco).toBeNull();
  });

  it("deve manter compatibilidade com buscarEnderecoPorCep", async () => {
    const endereco = await buscarEnderecoPorCep("01001-000");

    expect(endereco?.estado).toBe("SP");
  });

  it("deve retornar null para CEP inexistente no ViaCEP", async () => {
    const endereco = await consultarCep("99999999");

    expect(endereco).toBeNull();
  });

  it("deve retornar null quando ViaCEP responder 5xx", async () => {
    const endereco = await consultarCep("50000000");

    expect(endereco).toBeNull();
  });
});
