import Link from "next/link";
import type { StatusAtendimento } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { STATUS_COR, STATUS_LABELS, type StatusCor } from "@/domain/status";
import { cn } from "@/lib/utils";

type TomInfo = "info" | "warning" | "danger";

type FilaAtendimentoCardProps = {
  atendimentoId: string;
  codigo: string | null;
  nomeExibicao: string;
  documentoOuTelefone: string;
  status: StatusAtendimento;
  descricaoPrincipal: string;
  contagem?: {
    texto: string;
    tom: TomInfo;
  };
};

const STATUS_BADGE_CLASSES: Record<StatusCor, string> = {
  neutral: "bg-muted text-foreground",
  info: "bg-info-600/10 text-info-600",
  warning: "bg-warning-600/10 text-warning-600",
  success: "bg-success-600/10 text-success-600",
  danger: "bg-danger-600/10 text-danger-600",
};

const CONTAGEM_CLASSES: Record<TomInfo, string> = {
  info: "bg-info-600/10 text-info-600",
  warning: "bg-warning-600/10 text-warning-600",
  danger: "bg-danger-600/10 text-danger-600",
};

function codigoExibicao(codigo: string | null, atendimentoId: string) {
  if (codigo) {
    return codigo;
  }

  return atendimentoId.slice(0, 8).toUpperCase();
}

export default function FilaAtendimentoCard({
  atendimentoId,
  codigo,
  nomeExibicao,
  documentoOuTelefone,
  status,
  descricaoPrincipal,
  contagem,
}: FilaAtendimentoCardProps) {
  const corStatus = STATUS_COR[status];

  return (
    <Card size="sm">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">
            {codigoExibicao(codigo, atendimentoId)}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "border-transparent",
              STATUS_BADGE_CLASSES[corStatus],
            )}
          >
            {STATUS_LABELS[status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-1 text-sm">
        <p className="font-medium">{nomeExibicao}</p>
        <p className="text-xs text-muted-foreground">{documentoOuTelefone}</p>
        <p className="text-xs text-muted-foreground">{descricaoPrincipal}</p>
        {contagem ? (
          <Badge
            variant="outline"
            className={cn(
              "mt-1 border-transparent",
              CONTAGEM_CLASSES[contagem.tom],
            )}
          >
            {contagem.texto}
          </Badge>
        ) : null}
      </CardContent>

      <CardFooter className="justify-end">
        <Button asChild size="sm" variant="outline">
          <Link href={`/atendimentos/${atendimentoId}`}>
            Ir para o atendimento
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
