"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

export default function AdminSubmitButton({
  children,
  pendingLabel = "Enregistrement…",
  className = "admin-btn-primary",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? <><span className="admin-button-spinner" aria-hidden="true" />{pendingLabel}</> : children}
    </button>
  );
}
