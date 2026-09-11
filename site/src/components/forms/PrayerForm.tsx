"use client";

import { useTransition } from "react";
import { submitPrayerForm } from "@/lib/forms/actions";

export default function PrayerForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      // V2 (retour du 11/09, Lot 2) — classe renommée pour le nouveau style
      // visuel (voir globals.css) : composant propre à /connaitre-jesus,
      // jamais partagé, donc sans risque pour une autre page.
      className="v2-salvation-form"
      action={(formData) => {
        startTransition(() => {
          submitPrayerForm(formData);
        });
      }}
    >
      <input type="text" name="nom" placeholder="Nom" />
      <input type="text" name="ville" placeholder="Ville" />
      {/* required ajouté ici : l'astérisque était déjà visible dans la maquette
          statique (E-mail *) sans que le champ soit réellement obligatoire — cahier
          §3.4bis (incohérences UI relevées à corriger). */}
      <input type="email" name="email" placeholder="E-mail *" required />
      <input type="tel" name="telephone" placeholder="Téléphone" />
      <label>
        <input type="checkbox" name="accepte_contact" /> Oui, j&apos;accepte d&apos;être contacté(e) pour la prière du
        salut afin de recevoir Jésus dans mon cœur.
      </label>
      <button
        className="btn btn-primary"
        type="submit"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={isPending}
      >
        {isPending ? "Envoi…" : "Envoyer →"}
      </button>
    </form>
  );
}
