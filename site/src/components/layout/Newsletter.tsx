"use client";

import { useState, useTransition } from "react";
import { subscribeToNewsletter } from "@/lib/mailerlite/subscribe";

// Bloc newsletter "ParoleDeViePourVous". Un seul champ (email) + consentement RGPD —
// jamais de champ Nom/Ville en plus (cahier §1.2). Présent sur 15 des 23 pages.
//
// Inscription réelle vers MailerLite, message inline (pas de redirection vers
// /confirmation, pour ne pas interrompre la lecture d'un article — cahier
// §Partie 5 point 8).
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<"ok" | "error" | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(() => {
      subscribeToNewsletter(email).then((res) => {
        setResult(res.ok ? "ok" : "error");
        if (res.ok) setEmail("");
      });
    });
  }

  return (
    <div className="newsletter" id="newsletter">
      <div className="wrap">
        <h2>ParoleDeViePourVous</h2>
        <p>
          Recevez chaque semaine les nouvelles parutions et les publications de Serge Hapita,
          directement dans votre boîte mail.
        </p>
        {result === "ok" ? (
          <p style={{ fontWeight: 600 }}>Merci ! Votre inscription est confirmée.</p>
        ) : (
          <>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Votre adresse e-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={isPending || !consent}>
                {isPending ? "Inscription…" : "S'abonner →"}
              </button>
            </form>
            <label className="consent">
              <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>J&apos;accepte de recevoir les communications par e-mail (RGPD)</span>
            </label>
            {result === "error" && (
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Une erreur est survenue, merci de réessayer dans un instant.
              </p>
            )}
          </>
        )}
        <div className="fine">Aucun spam · Désabonnement en 1 clic</div>
      </div>
    </div>
  );
}
