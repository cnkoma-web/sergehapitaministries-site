"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/account/PasswordInput";

type Props = {
  userId: string;
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
};

export default function ProfileForm({ userId, initialFirstName, initialLastName, initialEmail }: Props) {
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
    const lastName = String(formData.get("last_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const newPassword = String(formData.get("password") ?? "").trim();

    const supabase = createClient();

    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .update({ first_name: firstName || null, last_name: lastName || null })
      .eq("id", userId)
      .select("id")
      .maybeSingle();
    if (profileError || !updatedProfile) {
      setError("Impossible de mettre à jour vos informations.");
      setLoading(false);
      return;
    }

    const authUpdates: { email?: string; password?: string; data: { first_name: string; last_name: string } } = {
      data: { first_name: firstName, last_name: lastName },
    };
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
      {error ? <div className="admin-error v2-profile-feedback">{error}</div> : null}
      {success ? (
        <div className="admin-error v2-profile-feedback" style={{ background: "#E3F5E9", color: "#1F8A4C" }}>
          {success}
        </div>
      ) : null}

      <div className="v2-profile-field">
        <label htmlFor="profile-first-name">Prénom</label>
        <input id="profile-first-name" name="first_name" type="text" defaultValue={initialFirstName} />
      </div>

      <div className="v2-profile-field">
        <label htmlFor="profile-last-name">Nom</label>
        <input id="profile-last-name" name="last_name" type="text" defaultValue={initialLastName} />
      </div>

      <div className="v2-profile-field v2-profile-form-full">
        <label htmlFor="profile-email">E-mail</label>
        <input id="profile-email" name="email" type="email" defaultValue={initialEmail} />
      </div>

      <div className="v2-profile-field v2-profile-form-full">
        <label htmlFor="profile-password">
          Nouveau mot de passe <span style={{ fontWeight: 400, color: "var(--v2-muted)" }}>(laisser vide pour ne pas changer)</span>
        </label>
        <PasswordInput
          id="profile-password"
          name="password"
          minLength={8}
          autoComplete="new-password"
          inputRef={passwordRef}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Enregistrement…" : "Enregistrer →"}
      </button>
    </form>
  );
}
