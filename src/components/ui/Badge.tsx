import type { ReactNode } from "react";

type BadgeProps = {
  label: ReactNode;
  status?: string;
};

export default function Badge({ label, status }: BadgeProps) {
  return <span data-status={status}>{label}</span>;
}
