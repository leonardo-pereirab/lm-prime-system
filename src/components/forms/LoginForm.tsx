"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

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
import { loginInputSchema, type LoginInput } from "@/schemas/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  function resolverDestinoAposLogin(valorNext: string | null) {
    if (!valorNext) {
      return "/dashboard";
    }

    if (!valorNext.startsWith("/") || valorNext.startsWith("//")) {
      return "/dashboard";
    }

    if (valorNext.startsWith("/login")) {
      return "/dashboard";
    }

    return valorNext;
  }

  async function onSubmit(input: LoginInput) {
    type LoginResponse = {
      success: boolean;
      data?: {
        autenticado?: boolean;
      };
      error?: {
        message?: string;
      };
    };

    try {
      const resposta = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const dados = (await resposta.json()) as LoginResponse;

      if (!resposta.ok || !dados.success) {
        toast.error(dados.error?.message ?? "Erro ao realizar login.");
        return;
      }

      toast.success("Login realizado com sucesso.");
      const destino = resolverDestinoAposLogin(searchParams.get("next"));
      router.replace(destino);
      router.refresh();
    } catch {
      toast.error("Erro de conexao. Tente novamente.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={form.formState.isSubmitting}
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
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
