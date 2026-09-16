"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// AJOUTÉ (chantier Compte, reprise) : § account-flow.js template
// "/compte/verification-email", bouton "Renvoyer l'e-mail" — entièrement
// absent de la V2 jusqu'ici. Fonction réelle (supabase.auth.resend), pas
// une simulation : nécessite l'adresse e-mail, transmise en paramètre lors
// de la redirection post-inscription (voir AuthTabs.tsx).
export default function ResendVerificationButton({ email }: { email: string | null }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!email) return null;

  async function handleClick() {
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email: email! });
    setState(error ? "error" : "sent");
  }

  return (
    <button type="button" className="account-link" onClick={handleClick} disabled={state === "sending" || state === "sent"}>
      {state === "sent" ? "E-mail renvoyé ✓" : state === "sending" ? "Envoi…" : state === "error" ? "Réessayer" : "Renvoyer l'e-mail"}
    </button>
  );
}
