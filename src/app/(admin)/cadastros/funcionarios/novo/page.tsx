"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ClassificacaoFuncionario } from "@prisma/client";
import type { input } from "zod";
import { criarFuncionario } from "@/app/(admin)/cadastros/funcionarios/_actions";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CepInput } from "@/components/forms/CepInput";
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
  funcionarioInputSchema,
  type FuncionarioInput,
} from "@/schemas/funcionario";

type FuncionarioFormInput = input<typeof funcionarioInputSchema>;

export default function NovoFuncionarioPage() {
  const form = useForm<FuncionarioFormInput, unknown, FuncionarioInput>({
    resolver: zodResolver(funcionarioInputSchema),
    mode: "onBlur",
    defaultValues: {
      nomeCompleto: "",
      emailCorporativo: "",
      cpf: "",
      telefonePrincipal: "",
      classificacao: ClassificacaoFuncionario.ATENDENTE,
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estadoUf: "",
    },
  });

  async function onSubmit(input: FuncionarioInput) {
    const resposta = await criarFuncionario(input);

    if (!resposta.success) {
      toast.error(resposta.error.message);
      return;
    }

    toast.success(
      `Funcionario convidado com matricula ${resposta.data.matricula}.`,
    );
    form.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Novo funcionario">
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados criticos para incluir o colaborador na lista branca.
        </p>
      </PageHeader>

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
                      <Input placeholder="Somente digitos" {...field} />
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
                      <Input placeholder="Somente digitos" {...field} />
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
                    <FormLabel>Classificacao</FormLabel>
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
                        disabled={form.formState.isSubmitting}
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
                    <FormLabel>Numero</FormLabel>
                    <FormControl>
                      <Input placeholder="Numero" {...field} />
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

              <div className="flex items-center justify-end gap-3 pt-2 md:col-span-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/cadastros/funcionarios">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Salvando..."
                    : "Cadastrar convidado"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
