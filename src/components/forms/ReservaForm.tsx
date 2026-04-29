import type { FormEvent } from "react";

type ReservaFormProps = {
  reserva?: unknown;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ReservaForm({ onSubmit }: ReservaFormProps) {
  return <form onSubmit={onSubmit} />;
}
