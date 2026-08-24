"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  initialFirstName: string;
  initialEmail: string;
};

export default function ProfileForm({ userId, initialFirstName, initialEmail }: Props) {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("first_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const newPassword = String(formData.get("password") ?? "").trim();

    const supabase = createClient();

    if (firstName) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ first_name: firstName })
        .eq("id", userId);
      if (profileError) {
        setError("Impossible de mettre à jour le prénom.");
        setLoading(false);
        return;
      }
    }

    const authUpdates: { email?: string; password?: string } = {};
    if (email && email !== initialEmail) authUpdates.email = email;
    if (newPassword) authUpdates.password = newPassword;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) {
        setError("Impossible de mettre à jour l'e-mail/mot de passe : " + authError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSuccess(
      authUpdates.email
        ? "Vos informations ont bien été mises à jour. Un e-mail de confirmation a été envoyé à votre nouvelle adresse."
        : "Vos informations ont bien été mises à jour."
    );
    if (passwordRef.current) passwordRef.current.value = "";
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-error" style={{ background: "#E3F5E9", color: "#1F8A4C" }}>{success}</div>}

      <label htmlFor="profile-first-name">Prénom</label>
      <input id="profile-first-name" name="first_name" type="text" defaultValue={initialFirstName} />

      <label htmlFor="profile-email">E-mail</label>
      <input id="profile-email" name="email" type="email" defaultValue={initialEmail} />

      <label htmlFor="profile-password">
        Nouveau mot de passe <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>(laisser vide pour ne pas changer)</span>
      </label>
      <input id="profile-password" name="password" type="password" minLength={8} autoComplete="new-password" ref={passwordRef} />

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Enregistrement…" : "Enregistrer →"}
      </button>
    </form>
  );
}
