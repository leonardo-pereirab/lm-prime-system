import type { FormEvent } from "react";

type ClienteFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  initialData?: unknown;
};

export default function ClienteForm({ onSubmit }: ClienteFormProps) {
  return <form onSubmit={onSubmit} />;
}
