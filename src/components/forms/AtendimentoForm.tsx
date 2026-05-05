import type { FormEvent } from "react";

type AtendimentoFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  initialData?: unknown;
};

export default function AtendimentoForm({ onSubmit }: AtendimentoFormProps) {
  return <form onSubmit={onSubmit} />;
}
