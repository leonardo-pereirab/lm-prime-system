"use client";

import Link from "next/link";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { input } from "zod";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import {
  ativacaoConclusaoInputSchema,
  ativacaoValidacaoInputSchema,
  type AtivacaoConclusaoInput,
  type AtivacaoValidacaoInput,
} from "@/schemas/auth";

type AtivacaoValidacaoFormInput = input<typeof ativacaoValidacaoInputSchema>;
type AtivacaoConclusaoFormInput = input<typeof ativacaoConclusaoInputSchema>;

type DadosCriticos = {
  matricula: string;
  nomeCompleto: string;
  emailCorporativo: string;
  cpf: string;
  telefonePrincipal: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estadoUf: string;
  classificacao: "GERENTE" | "ATENDENTE";
};

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string } };

export default function AtivacaoContaForm() {
  const [dadosCriticos, setDadosCriticos] = useState<DadosCriticos | null>(
    null,
  );
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false);

  const formValidacao = useForm<
    AtivacaoValidacaoFormInput,
    unknown,
    AtivacaoValidacaoInput
  >({
    resolver: zodResolver(ativacaoValidacaoInputSchema),
    mode: "onBlur",
    defaultValues: { email: "", matricula: "" },
  });

  const formConclusao = useForm<
    AtivacaoConclusaoFormInput,
    unknown,
    AtivacaoConclusaoInput
  >({
    resolver: zodResolver(ativacaoConclusaoInputSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      matricula: "",
      senha: "",
      confirmarSenha: "",
      telefoneAdicional: "",
      aceitouTermos: false,
      versaoTermosAceita: "v1",
    },
  });

  async function validarDados(input: AtivacaoValidacaoInput) {
    try {
      const resposta = await fetch("/api/auth/ativacao/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const json = (await resposta.json()) as ApiEnvelope<DadosCriticos>;
      if (!resposta.ok || !json.success) {
        toast.error(
          !json.success
            ? json.error.message
            : "Dados não reconhecidos. Insira dados já autorizados pela empresa.",
        );
        return;
      }

      setDadosCriticos(json.data);
      formConclusao.reset({
        ...formConclusao.getValues(),
        email: input.email,
        matricula: input.matricula,
      });
      toast.success("Dados validados. Conclua seu cadastro.");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  async function concluirCadastro(input: AtivacaoConclusaoInput) {
    try {
      const payload = {
        ...input,
        telefoneAdicional:
          input.telefoneAdicional?.trim() === ""
            ? undefined
            : input.telefoneAdicional,
      };

      const resposta = await fetch("/api/auth/ativacao/concluir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await resposta.json()) as ApiEnvelope<unknown>;

      if (!resposta.ok || !json.success) {
        toast.error(
          !json.success
            ? json.error.message
            : "Não foi possível concluir ativação.",
        );
        return;
      }

      toast.success("Conta ativada com sucesso. Você já pode fazer login.");
      setDadosCriticos(null);
      formValidacao.reset();
      formConclusao.reset({
        email: "",
        matricula: "",
        senha: "",
        confirmarSenha: "",
        telefoneAdicional: "",
        aceitouTermos: false,
        versaoTermosAceita: "v1",
      });
      setSenhaVisivel(false);
      setConfirmacaoVisivel(false);
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  if (!dadosCriticos) {
    return (
      <Form {...formValidacao}>
        <form
          onSubmit={formValidacao.handleSubmit(validarDados)}
          className="space-y-4"
        >
          <FormField
            control={formValidacao.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail corporativo</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nome@empresa.com"
                    autoComplete="email"
                    disabled={formValidacao.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formValidacao.control}
            name="matricula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex.: FUN-00001"
                    disabled={formValidacao.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={formValidacao.formState.isSubmitting}
          >
            {formValidacao.formState.isSubmitting
              ? "Validando..."
              : "Validar dados"}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm">
        <p className="font-medium text-neutral-900">
          Dados criticos (somente leitura)
        </p>
        <p>
          <span className="font-medium">Nome:</span>{" "}
          {dadosCriticos.nomeCompleto}
        </p>
        <p>
          <span className="font-medium">E-mail:</span>{" "}
          {dadosCriticos.emailCorporativo}
        </p>
        <p>
          <span className="font-medium">CPF:</span> {dadosCriticos.cpf}
        </p>
        <p>
          <span className="font-medium">Matrícula:</span>{" "}
          {dadosCriticos.matricula}
        </p>
      </div>

      <Form {...formConclusao}>
        <form
          onSubmit={formConclusao.handleSubmit(concluirCadastro)}
          className="space-y-4"
        >
          <FormField
            control={formConclusao.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={senhaVisivel ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={formConclusao.formState.isSubmitting}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      aria-label={
                        senhaVisivel ? "Ocultar senha" : "Mostrar senha"
                      }
                      onClick={() => setSenhaVisivel((atual) => !atual)}
                      disabled={formConclusao.formState.isSubmitting}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    >
                      {senhaVisivel ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formConclusao.control}
            name="confirmarSenha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={confirmacaoVisivel ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={formConclusao.formState.isSubmitting}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      aria-label={
                        confirmacaoVisivel ? "Ocultar senha" : "Mostrar senha"
                      }
                      onClick={() => setConfirmacaoVisivel((atual) => !atual)}
                      disabled={formConclusao.formState.isSubmitting}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    >
                      {confirmacaoVisivel ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formConclusao.control}
            name="telefoneAdicional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone adicional (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Somente dígitos"
                    disabled={formConclusao.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formConclusao.control}
            name="aceitouTermos"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-start gap-2 text-sm leading-6 text-neutral-700">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    disabled={formConclusao.formState.isSubmitting}
                  />
                  <span>
                    Li e concordo com os termos e politicas de seguranca.{" "}
                    <Link
                      href="/termos-politicas-seguranca"
                      className="font-medium text-primary-700 hover:text-primary-800"
                      target="_blank"
                    >
                      Ler termos
                    </Link>
                  </span>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setDadosCriticos(null)}
              disabled={formConclusao.formState.isSubmitting}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={formConclusao.formState.isSubmitting}
            >
              {formConclusao.formState.isSubmitting
                ? "Concluindo..."
                : "Concluir cadastro"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
