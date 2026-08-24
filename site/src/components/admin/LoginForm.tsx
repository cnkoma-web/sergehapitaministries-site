"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Identifiants incorrects, ou ce compte n'a pas accès à l'administration.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      {error && <div className="admin-error">{error}</div>}
      <div className="admin-field" style={{ marginBottom: 16 }}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div className="admin-field" style={{ marginBottom: 20 }}>
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button type="submit" className="admin-btn-primary" style={{ width: "100%" }} disabled={loading}>
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
