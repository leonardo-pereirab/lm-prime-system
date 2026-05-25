"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { requestJson } from "@/hooks/http";

export function useAuth() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, senha }: { email: string; senha: string }) =>
      requestJson("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      }),
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  return {
    login: (email: string, senha: string) =>
      loginMutation.mutate({ email, senha }),
    loading: loginMutation.isPending,
    error:
      loginMutation.error instanceof Error ? loginMutation.error.message : null,
  };
}
