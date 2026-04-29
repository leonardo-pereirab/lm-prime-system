import type { FormEvent } from "react";

type MotoristaFormProps = {
  motorista?: unknown;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function MotoristaForm({ onSubmit }: MotoristaFormProps) {
  return <form onSubmit={onSubmit} />;
}
