"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribeToNewsletter } from "@/lib/mailerlite/subscribe";
import { createClient } from "@/lib/supabase/client";
import { isRealUser } from "@/lib/supabase/realUser";
import BotTrapFields from "@/components/security/BotTrapFields";
import TurnstileWidget from "@/components/security/TurnstileWidget";

// Bloc newsletter "ParoleDeViePourVous". Un seul champ (email) + consentement RGPD —
// jamais de champ Nom/Ville en plus (cahier §1.2). Présent sur 15 des 23 pages.
//
// Inscription réelle vers MailerLite, message inline (pas de redirection vers
// /confirmation, pour ne pas interrompre la lecture d'un article — cahier
// §Partie 5 point 8).
//
// Structure reconstruite le 12/09 (audit systématique des titres h1-h4 du
// site) — reproduit prototype-html/styles.css § .newsletter/.newsletter-
// inner/.newsletter-form : grille à 2 colonnes (texte + formulaire), eyebrow
// "Newsletter", vrai <label> visible pour le champ e-mail (le texte "Votre
// adresse e-mail" faisait à tort office de placeholder), jamais reconstruit
// depuis le début du chantier malgré sa présence sur la quasi-totalité des
// pages.
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [usesAccountEmail, setUsesAccountEmail] = useState(false);
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<"ok" | "error" | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active || !isRealUser(user) || !user.email) return;
      setEmail((currentEmail) => currentEmail || user.email || "");
      setUsesAccountEmail(true);
    });

    return () => {
      active = false;
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    startTransition(async () => {
      const res = await subscribeToNewsletter(formData);
      setResult(res.ok ? "ok" : "error");
      if (res.ok) setEmail("");
      else setCaptchaReset((value) => value + 1);
    });
  }

  return (
    <div className="newsletter" id="newsletter">
      <div className="v2-wrap newsletter-inner">
        <div>
          <p className="v2-eyebrow light">
            <span /> Newsletter
          </p>
          <h2>ParoleDeViePourVous</h2>
          <p>
            Recevez chaque semaine les nouvelles parutions et les publications de Serge Hapita,
            directement dans votre boîte mail.
          </p>
        </div>
        <div>
          {result === "ok" ? (
            <p style={{ fontWeight: 600 }}>Merci ! Votre inscription est confirmée.</p>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <label htmlFor="newsletter-email">Votre adresse e-mail</label>
              <div>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  placeholder="vous@exemple.fr"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" disabled={isPending || !consent}>
                  {isPending ? "Inscription…" : "S'inscrire"} <span>→</span>
                </button>
              </div>
              {usesAccountEmail && (
                <p className="form-note">L&apos;adresse liée à votre compte est déjà renseignée.</p>
              )}
              <label className="consent">
                <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>J&apos;accepte de recevoir les communications par e-mail (RGPD)</span>
              </label>
              <BotTrapFields />
              <TurnstileWidget action="newsletter" resetSignal={captchaReset} />
              {result === "error" && (
                <p style={{ fontSize: 13, marginTop: 8 }}>
                  Une erreur est survenue, merci de réessayer dans un instant.
                </p>
              )}
              <p className="form-note">Aucun spam · Désabonnement en 1 clic</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
