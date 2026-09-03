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
    <div className="donate-card">
      <h2>Devenez un semeur de la Parole par votre don</h2>
      <p>
        Merci beaucoup d&apos;avoir envisagé de devenir partenaire en soutenant ce ministère. Nous ne prenons pas
        votre générosité à la légère. Votre soutien financier est le fondement de cet important travail ministériel.
      </p>

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
