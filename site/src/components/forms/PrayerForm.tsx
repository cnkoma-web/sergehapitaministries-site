"use client";

import { useTransition } from "react";
import { submitPrayerForm } from "@/lib/forms/actions";
import BotTrapFields from "@/components/security/BotTrapFields";
import TurnstileWidget from "@/components/security/TurnstileWidget";

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
      {/* Retour de validation humaine (section "Je veux recevoir Jésus") :
          la maquette place le libellé de chaque champ au-dessus de lui
          (une seule balise <label>, texte + <input>), pas de placeholder
          en guise de libellé — repris ici à l'identique, champs réels
          inchangés. */}
      <label>
        Nom
        <input type="text" name="nom" placeholder="Votre nom" />
      </label>
      <label>
        Ville
        <input type="text" name="ville" placeholder="Votre ville" />
      </label>
      {/* required conservé ici (fonctionnalité réelle, cahier §3.4bis) même si
          la maquette statique ne rend pas ce champ obligatoire — l'astérisque
          passe du placeholder au libellé pour ne pas altérer le placeholder
          "vous@exemple.fr" prévu par la maquette. */}
      <label>
        E-mail *
        <input type="email" name="email" placeholder="vous@exemple.fr" required />
      </label>
      <label>
        Téléphone
        <input type="tel" name="telephone" placeholder="Votre numéro" />
      </label>
      <label className="v2-salvation-consent">
        <input type="checkbox" name="accepte_contact" />
        <span>Oui, j&apos;accepte d&apos;être contacté(e) pour la prière du salut afin de recevoir Jésus dans mon cœur.</span>
      </label>
      <BotTrapFields />
      <TurnstileWidget action="prayer" />
      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Envoi…" : "Envoyer →"}
      </button>
    </form>
  );
}
