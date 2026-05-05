import type { FormEvent } from "react";

type ParceiroFormProps = {
  parceiro?: unknown;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ParceiroForm({ onSubmit }: ParceiroFormProps) {
  return <form onSubmit={onSubmit} />;
}
