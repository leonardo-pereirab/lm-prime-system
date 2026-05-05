import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const variantClasse =
    variant === "secondary"
      ? "btn-secondary"
      : variant === "danger"
        ? "btn-danger"
        : "btn-primary";

  const classes = ["btn", variantClasse, className].filter(Boolean).join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
