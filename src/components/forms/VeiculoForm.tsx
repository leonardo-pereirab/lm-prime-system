import type { FormEvent } from "react";

type VeiculoFormProps = {
  veiculo?: unknown;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function VeiculoForm({ onSubmit }: VeiculoFormProps) {
  return <form onSubmit={onSubmit} />;
}
