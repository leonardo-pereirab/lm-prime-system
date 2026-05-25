import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://viacep.com.br/ws/:cep/json", ({ params }) => {
    const cep = String(params.cep ?? "00000000");

    if (cep === "99999999") {
      return HttpResponse.json({ erro: true });
    }

    if (cep === "50000000") {
      return HttpResponse.json({ erro: "falha_externa" }, { status: 500 });
    }

    return HttpResponse.json({
      cep,
      logradouro: "Rua Exemplo",
      complemento: "",
      bairro: "Centro",
      localidade: "Sao Paulo",
      uf: "SP",
      ibge: "3550308",
      gia: "1004",
      ddd: "11",
      siafi: "7107",
    });
  }),
];
