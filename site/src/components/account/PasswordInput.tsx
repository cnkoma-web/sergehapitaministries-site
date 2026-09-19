"use client";

import { useState, type Ref } from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  minLength?: number;
  inputRef?: Ref<HTMLInputElement>;
};

export default function PasswordInput({
  id,
  name,
  autoComplete,
  required = false,
  minLength,
  inputRef,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        ref={inputRef}
      />
      <button
        type="button"
        className="password-visibility-toggle"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        onClick={() => setVisible((current) => !current)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.7" />
          {visible && <path d="m4 4 16 16" />}
        </svg>
      </button>
    </div>
  );
}
