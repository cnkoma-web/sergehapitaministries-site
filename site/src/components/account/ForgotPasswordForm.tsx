"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TurnstileWidget from "@/components/security/TurnstileWidget";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!captchaToken) {
      setError("La vérification de sécurité est encore en cours. Réessayez dans un instant.");
      return;
    }
    setLoading(true);

    const email = String(new FormData(e.currentTarget).get("email"));
    const supabase = createClient();
    // La vraie destination est désormais écrite en dur dans le gabarit
    // "Reset Password" du tableau de bord Supabase (voir
    // src/app/auth/confirm/route.ts, retour du 06/09) — ce qui garantit
    // qu'un lien déclenché manuellement depuis le tableau de bord atterrit
    // aussi au bon endroit, pas seulement ceux envoyés depuis ce formulaire.
    // `redirectTo` reste passé ici par sécurité (repli inoffensif si le
    // gabarit n'a pas encore été mis à jour), mais n'est plus ce qui pilote
    // le comportement réel.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/compte/nouveau-mot-de-passe`,
      captchaToken,
    });

    setLoading(false);
    if (resetError) {
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
      setError("Impossible d'envoyer l'e-mail pour le moment. Réessayez plus tard.");
      return;
    }
    // V2 (Lot 7, 11/09) — vraie page dédiée (/compte/email-envoye), comme
    // la maquette, plutôt qu'un message affiché en ligne sous le formulaire
    // (décision prise avec Serge le 11/09).
    router.push("/compte/email-envoye");
  }

  return (
    // .v2-account-flow-form (chantier Compte, reprise) : le formulaire
    // empruntait à tort le style de la page /compte (.account-form, gap
    // 14px, input 49px) — la maquette réelle de ce gabarit (§ account-
    // flow.js .account-flow-form) déclare gap 10px / input min-height
    // 50px, une classe distincte jamais reprise jusqu'ici.
    <form id="forgot-password-form" className="v2-account-flow-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}
      <label htmlFor="forgot-email">Adresse e-mail</label>
      <input id="forgot-email" name="email" type="email" required autoComplete="username" />
      <TurnstileWidget action="password_reset" name={false} onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button type="submit" disabled={loading || !captchaToken}>
        {loading ? "Envoi…" : "Recevoir le lien →"}
      </button>
    </form>
  );
}
