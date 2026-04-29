import type { FormEvent } from "react";

type UsuarioFormProps = {
  usuario?: unknown;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function UsuarioForm({ onSubmit }: UsuarioFormProps) {
  return <form onSubmit={onSubmit} />;
}
