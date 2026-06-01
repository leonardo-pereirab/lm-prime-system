import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardIndicadores } from "@/hooks/useDashboard";

type TopRecursosProps = {
  indicadores: DashboardIndicadores;
};

type TopListaProps = {
  titulo: string;
  itens: Array<{ id: string; nome: string; total: number }>;
};

function TopLista({ titulo, itens }: TopListaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados no periodo.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {itens.map((item, indice) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate">
                  {indice + 1}. {item.nome}
                </span>
                <span className="font-semibold">{item.total}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function TopRecursos({ indicadores }: TopRecursosProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <TopLista
        titulo="Motoristas mais usados"
        itens={indicadores.topRecursos.motoristas}
      />
      <TopLista
        titulo="Veiculos mais usados"
        itens={indicadores.topRecursos.veiculos}
      />
      <TopLista
        titulo="Parceiros mais usados"
        itens={indicadores.topRecursos.parceiros}
      />
    </div>
  );
}
