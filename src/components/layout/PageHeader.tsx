import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
