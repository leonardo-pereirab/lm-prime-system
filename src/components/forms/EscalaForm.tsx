import type { FormEvent } from "react";

type EscalaFormProps = {
  escala?: unknown;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function EscalaForm({ onSubmit }: EscalaFormProps) {
  return <form onSubmit={onSubmit} />;
}
