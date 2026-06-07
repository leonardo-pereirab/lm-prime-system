"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";

export default function ShowcasePage() {
  const [aberto, setAberto] = useState(false);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary-600">Fase 11</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Showcase de componentes-base
          </h1>
          <p className="max-w-2xl text-sm text-neutral-600">
            Página temporária para validar a integração do shadcn com os tokens
            visuais do projeto.
          </p>
        </div>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <CardTitle>Primitivos principais</CardTitle>
              <Badge variant="secondary">Smoke test</Badge>
            </div>
            <CardDescription>
              Button, Input, Badge e Dialog aplicados com a identidade visual do
              sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input placeholder="Digite um valor de exemplo" />
              <Button type="button" onClick={() => setAberto(true)}>
                Abrir dialog
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge>Padrao</Badge>
              <Badge variant="secondary">Secundario</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destrutivo</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" type="button">
              Acao secundaria
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmação visual</DialogTitle>
            <DialogDescription>
              Este dialog existe apenas para validar espacos, bordas, foco e
              tipografia da base UI.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setAberto(false)}
            >
              Fechar
            </Button>
            <Button type="button" onClick={() => setAberto(false)}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
