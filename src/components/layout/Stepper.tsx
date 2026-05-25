import Link from "next/link";
import {
  BanIcon,
  CheckIcon,
  CircleIcon,
  LockIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { EtapaVisualStatus } from "@/domain/status";

type StepperEtapa = {
  label: string;
  href: string;
  status: EtapaVisualStatus;
};

type StepperProps = {
  etapas: StepperEtapa[];
};

const ICONE_POR_STATUS: Record<EtapaVisualStatus, LucideIcon> = {
  concluida: CheckIcon,
  atual: CircleIcon,
  pendente: CircleIcon,
  bloqueada: LockIcon,
  cancelada: BanIcon,
};

const ESTILO_POR_STATUS: Record<EtapaVisualStatus, string> = {
  concluida:
    "border-success-600/30 bg-success-600/10 text-success-600 hover:bg-success-600/15",
  atual: "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
  pendente: "border-border bg-muted text-muted-foreground",
  bloqueada: "border-border bg-muted text-muted-foreground",
  cancelada: "border-danger-600/30 bg-danger-600/10 text-danger-600",
};

function etapaClicavel(status: EtapaVisualStatus) {
  return status === "concluida" || status === "atual";
}

function EtapaItem({ etapa }: { etapa: StepperEtapa }) {
  const Icone = ICONE_POR_STATUS[etapa.status];
  const clicavel = etapaClicavel(etapa.status);

  const conteudo = (
    <>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border",
          ESTILO_POR_STATUS[etapa.status],
        )}
      >
        <Icone className="size-3.5" />
      </span>
      <span className="text-sm font-medium whitespace-nowrap">
        {etapa.label}
      </span>
    </>
  );

  if (!clicavel) {
    return (
      <span
        aria-disabled="true"
        className="flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground"
      >
        {conteudo}
      </span>
    );
  }

  return (
    <Link
      href={etapa.href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 transition-colors",
        etapa.status === "atual"
          ? "text-primary"
          : "text-foreground hover:bg-muted",
      )}
    >
      {conteudo}
    </Link>
  );
}

export default function Stepper({ etapas }: StepperProps) {
  return (
    <nav aria-label="Etapas do atendimento" className="w-full">
      <ol className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1">
        {etapas.map((etapa, indice) => {
          const ultima = indice === etapas.length - 1;

          return (
            <li
              key={`${etapa.href}-${etapa.label}`}
              className="flex min-w-0 flex-1 items-center"
            >
              <EtapaItem etapa={etapa} />
              {!ultima ? (
                <span className="mx-2 hidden h-px flex-1 bg-border md:block" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
