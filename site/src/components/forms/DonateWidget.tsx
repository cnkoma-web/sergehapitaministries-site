"use client";

import { useState, useTransition } from "react";
import { createDonationCheckoutSession, type DonationFrequency } from "@/lib/stripe/donate";

const PRESET_AMOUNTS = [10, 30, 60, 100, 250, 500];
const FREQUENCIES: { value: DonationFrequency; label: string }[] = [
  { value: "unique", label: "Unique" },
  { value: "mensuel", label: "Mensuel" },
  { value: "annuel", label: "Annuel" },
];
const FREQUENCY_BUTTON_WORD: Record<DonationFrequency, string> = {
  unique: "",
  mensuel: " mensuel",
  annuel: " annuel",
};

export default function DonateWidget() {
  const [frequency, setFrequency] = useState<DonationFrequency>("unique");
  const [amount, setAmount] = useState<number | "custom">(10);
  const [customAmount, setCustomAmount] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const effectiveAmount = amount === "custom" ? Math.round(Number(customAmount || 0)) : amount;
  const amountValid = Number.isFinite(effectiveAmount) && effectiveAmount >= 1;

  function handleSubmit() {
    setError(null);
    if (!amountValid) {
      setError("Merci d'indiquer un montant valide.");
      return;
    }
    startTransition(() => {
      createDonationCheckoutSession(frequency, effectiveAmount * 100, comment).then((result) => {
        if (result?.error) setError("Une erreur est survenue. Merci de réessayer.");
      });
    });
  }

  return (
    // V2 (retour du 11/09, Lot 6) — le titre/texte d'intro (auparavant
    // dupliqué ici) vit désormais dans .v2-donation-copy, à côté de la
    // carte plutôt que dedans (voir partenariat/page.tsx) — reproduit
    // prototype-html/partenariat/index.html § .donation-card, qui ne
    // porte que "Votre don" en h3.
    <div className="donate-card">
      <h3>Votre don</h3>
      <p>Choisissez la fréquence et le montant de votre soutien.</p>

      <span className="v2-choice-label">Fréquence</span>
      <div className="freq-toggle">
        {FREQUENCIES.map((f) => (
          <button
            key={f.value}
            type="button"
            className={frequency === f.value ? "active" : undefined}
            onClick={() => setFrequency(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <span className="v2-choice-label">Montant</span>
      <div className="amount-grid">
        {PRESET_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            className={amount === a ? "amount-opt active" : "amount-opt"}
            onClick={() => setAmount(a)}
          >
            {a} €
          </button>
        ))}
      </div>
      <button
        type="button"
        className={amount === "custom" ? "amount-opt active" : "amount-opt"}
        style={{ width: "100%", marginBottom: 20 }}
        onClick={() => setAmount("custom")}
      >
        Autre montant
      </button>

      {amount === "custom" && (
        <div className="custom-amount show">
          {/* type="text" + inputMode="numeric" (retour du 05/09) — plus de
              champ type="number" avec ses flèches d'incrémentation.
              inputMode garde le clavier numérique sur mobile ; le filtrage
              au changement retire tout caractère non numérique. */}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Montant en €"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </div>
      )}

      <span className="v2-choice-label">
        Commentaire <span style={{ fontWeight: 500, color: "var(--v2-muted)", fontSize: 11 }}>(facultatif)</span>
      </span>
      <textarea
        maxLength={100}
        placeholder="Commentaire (facultatif)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="char-count">
        <span>{comment.length}</span>/100
      </div>

      {error && <p style={{ color: "var(--red, #c0392b)", fontSize: 13.5, marginBottom: 12 }}>{error}</p>}

      <button
        className="btn btn-primary"
        type="button"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={isPending || !amountValid}
        onClick={handleSubmit}
      >
        {isPending
          ? "Redirection…"
          : `Faire un don${FREQUENCY_BUTTON_WORD[frequency]} de ${amountValid ? effectiveAmount : 0} €`}
      </button>
    </div>
  );
}
