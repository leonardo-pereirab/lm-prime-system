"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  titulo: string;
  descricao: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  varianteConfirmar?: "default" | "destructive";
  carregando?: boolean;
  onConfirmar: () => void | Promise<void>;
};

export function ConfirmDialog({
  aberto,
  onAbertoChange,
  titulo,
  descricao,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  varianteConfirmar = "default",
  carregando = false,
  onConfirmar,
}: ConfirmDialogProps) {
  const [confirmando, setConfirmando] = useState(false);

  async function handleConfirmar() {
    try {
      setConfirmando(true);
      await onConfirmar();
      onAbertoChange(false);
    } finally {
      setConfirmando(false);
    }
  }

  const bloqueado = carregando || confirmando;

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onAbertoChange(false)}
            disabled={bloqueado}
          >
            {textoCancelar}
          </Button>
          <Button
            type="button"
            variant={varianteConfirmar}
            onClick={handleConfirmar}
            disabled={bloqueado}
          >
            {bloqueado ? "Processando..." : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
