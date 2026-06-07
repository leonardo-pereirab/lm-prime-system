"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { input } from "zod";
import { toast } from "sonner";
import {
  ativarFuncionario,
  atualizarFuncionario,
  excluirOuAnonimizarFuncionario,
  inativarFuncionario,
} from "@/app/(admin)/cadastros/funcionarios/_actions";
import { CepInput } from "@/components/forms/CepInput";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  funcionarioUpdateSchema,
  type FuncionarioUpdate,
} from "@/schemas/funcionario";
import { useFuncionario } from "@/hooks/useFuncionarios";

type FuncionarioUpdateFormInput = input<typeof funcionarioUpdateSchema>;

function labelEstado(estado: string) {
  if (estado === "ATIVO") return "Ativo";
  if (estado === "INATIVO") return "Inativo";
  return "Convidado";
}

export default function FuncionarioDetalhePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [acaoPendente, setAcaoPendente] = useState<
    "ativar" | "inativar" | "excluir" | null
  >(null);
  const [executandoAcao, setExecutandoAcao] = useState(false);

  const { data, isLoading } = useFuncionario(id);

  const valoresIniciais = useMemo<FuncionarioUpdateFormInput>(
    () => ({
      nomeCompleto: data?.nomeCompleto ?? "",
      emailCorporativo: data?.emailCorporativo ?? "",
      cpf: data?.cpf ?? "",
      telefonePrincipal: data?.telefonePrincipal ?? "",
      classificacao: data?.classificacao ?? "ATENDENTE",
      cep: data?.cep ?? "",
      logradouro: data?.logradouro ?? "",
      numero: data?.numero ?? "",
      complemento: data?.complemento ?? "",
      bairro: data?.bairro ?? "",
      cidade: data?.cidade ?? "",
      estadoUf: data?.estadoUf ?? "",
    }),
    [data],
  );

  const form = useForm<FuncionarioUpdateFormInput, unknown, FuncionarioUpdate>({
    resolver: zodResolver(funcionarioUpdateSchema),
    mode: "onBlur",
    values: valoresIniciais,
  });

  async function onSubmit(inputDados: FuncionarioUpdate) {
    const resposta = await atualizarFuncionario(id, inputDados);

    if (!resposta.success) {
      toast.error(resposta.error.message);
      return;
    }

    toast.success("Dados do funcionario atualizados com sucesso.");
    router.refresh();
  }

  async function executarAcao() {
    if (!acaoPendente) {
      return;
    }

    try {
      setExecutandoAcao(true);

      if (acaoPendente === "ativar") {
        const resposta = await ativarFuncionario(id);

        if (!resposta.success) {
          toast.error(resposta.error.message);
          return;
        }

        toast.success("Funcionario ativado com sucesso.");
      }

      if (acaoPendente === "inativar") {
        const resposta = await inativarFuncionario(id);

        if (!resposta.success) {
          toast.error(resposta.error.message);
          return;
        }

        toast.success("Funcionario inativado com sucesso.");
      }

      if (acaoPendente === "excluir") {
        const resposta = await excluirOuAnonimizarFuncionario(id);

        if (!resposta.success) {
          toast.error(resposta.error.message);
          return;
        }

        const mensagem =
          resposta.data.modo === "EXCLUIDO"
            ? "Funcionário excluído com sucesso."
            : "Funcionario anonimizado com sucesso.";

        toast.success(mensagem);
      }

      setAcaoPendente(null);
      router.refresh();
    } finally {
      setExecutandoAcao(false);
    }
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Carregando funcionario...</p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Funcionário não encontrado.</p>
        <Button asChild variant="outline">
          <Link href="/cadastros/funcionarios">Voltar para listagem</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar funcionario">
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Matrícula {data.matricula} • Estado {labelEstado(data.estado)}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {data.classificacao === "GERENTE" ? "Gerente" : "Atendente"}
            </Badge>
            {data.anonimizadoEm ? (
              <Badge variant="destructive">Anonimizado</Badge>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/cadastros/funcionarios">Voltar</Link>
            </Button>
          </div>
        </div>
      </PageHeader>

      {!data.anonimizadoEm ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {data.estado !== "ATIVO" ? (
                <Button
                  type="button"
                  onClick={() => setAcaoPendente("ativar")}
                  disabled={executandoAcao}
                >
                  Ativar funcionario
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAcaoPendente("inativar")}
                  disabled={executandoAcao}
                >
                  Inativar funcionario
                </Button>
              )}

              <Button
                type="button"
                variant="destructive"
                onClick={() => setAcaoPendente("excluir")}
                disabled={executandoAcao}
              >
                Excluir ou anonimizar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="nomeCompleto"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailCorporativo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail corporativo</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nome@empresa.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="Somente dígitos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefonePrincipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Somente dígitos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classificacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classificação</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GERENTE">Gerente</SelectItem>
                        <SelectItem value="ATENDENTE">Atendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <CepInput
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        onEnderecoEncontrado={(endereco) => {
                          if (!endereco) {
                            return;
                          }

                          form.setValue(
                            "logradouro",
                            endereco.logradouro ?? "",
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            },
                          );
                          form.setValue("bairro", endereco.bairro ?? "", {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                          form.setValue("cidade", endereco.cidade ?? "", {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                          form.setValue("estadoUf", endereco.estado ?? "", {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                        onErroBusca={(mensagem) => toast.error(mensagem)}
                        disabled={
                          form.formState.isSubmitting || !!data.anonimizadoEm
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logradouro"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, avenida..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Número" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estadoUf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input placeholder="SP" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !!data.anonimizadoEm}
                >
                  {form.formState.isSubmitting
                    ? "Salvando..."
                    : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ConfirmDialog
        aberto={acaoPendente !== null}
        onAbertoChange={(aberto) => {
          if (!aberto) {
            setAcaoPendente(null);
          }
        }}
        titulo={
          acaoPendente === "ativar"
            ? "Ativar funcionario"
            : acaoPendente === "inativar"
              ? "Inativar funcionario"
              : "Excluir ou anonimizar funcionario"
        }
        descricao={
          acaoPendente === "ativar"
            ? "Deseja ativar este funcionario e liberar acesso ao sistema?"
            : acaoPendente === "inativar"
              ? "Deseja inativar este funcionario e bloquear novos logins?"
              : "Se for convidado sem uso, será excluído. Caso contrário, os dados serão anonimizados."
        }
        textoConfirmar={
          acaoPendente === "ativar"
            ? "Ativar"
            : acaoPendente === "inativar"
              ? "Inativar"
              : "Confirmar"
        }
        varianteConfirmar={
          acaoPendente === "excluir" ? "destructive" : "default"
        }
        carregando={executandoAcao}
        onConfirmar={executarAcao}
      />
    </div>
  );
}
