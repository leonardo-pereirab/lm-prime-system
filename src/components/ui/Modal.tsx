import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true">
      <div>
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Fechar">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
