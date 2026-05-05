import type { ReactNode } from "react";

type BadgeProps = {
  label: ReactNode;
  status?: string;
};

export default function Badge({ label, status }: BadgeProps) {
  const statusClasse = status ? `badge--${status}` : "";
  const classes = ["badge", statusClasse].filter(Boolean).join(" ");

  return <span className={classes}>{label}</span>;
}
