import type { FormEvent } from "react";

type OrcamentoFormProps = {
  orcamento?: unknown;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function OrcamentoForm({ onSubmit }: OrcamentoFormProps) {
  return <form onSubmit={onSubmit} />;
}
