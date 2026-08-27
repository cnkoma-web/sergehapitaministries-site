"use client";

import { useTransition } from "react";
import { submitInvitationForm } from "@/lib/forms/actions";

export default function InvitationForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          submitInvitationForm(formData);
        });
      }}
    >
      <div className="inv-form-section">
        <h2>Vos coordonnées</h2>
        <div className="inv-row">
          <div>
            <label className="field-label">Prénom *</label>
            <input type="text" name="prenom" required />
          </div>
          <div>
            <label className="field-label">Nom *</label>
            <input type="text" name="nom" required />
          </div>
        </div>
        <div className="inv-row">
          <div>
            <label className="field-label">E-mail *</label>
            <input type="email" name="email" required />
          </div>
          <div>
            <label className="field-label">Téléphone *</label>
            <input type="tel" name="telephone" required />
          </div>
        </div>
      </div>

      <div className="inv-form-section">
        <h2>Votre structure</h2>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Hôte (Église / Ministère qui invite) *</label>
          <input type="text" name="hote" required />
        </div>
        <div className="inv-row">
          <div>
            <label className="field-label">Pays *</label>
            <input type="text" name="pays" required />
          </div>
          <div>
            <label className="field-label">Ville *</label>
            <input type="text" name="ville" required />
          </div>
        </div>
      </div>

      <div className="inv-form-section">
        <h2>L&apos;événement</h2>
        <div className="inv-row">
          <div>
            <label className="field-label">Type d&apos;invitation *</label>
            <select name="type_invitation" required defaultValue="">
              <option value="" disabled>
                Sélectionnez un type
              </option>
              <option>Conférence</option>
              <option>Séminaire</option>
              <option>Culte / Prédication</option>
              <option>Formation</option>
              <option>Autre</option>
            </select>
          </div>
          <div>
            <label className="field-label">Ministère désiré *</label>
            <select name="ministere_desire" required defaultValue="">
              <option value="" disabled>
                Sélectionnez un ministère
              </option>
              <option>Enseignement de la Parole</option>
              <option>Message prophétique</option>
              <option>Guérison / Délivrance</option>
              <option>Autre</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Thème de l&apos;événement *</label>
          <input type="text" name="theme" required />
        </div>
        <div className="inv-row">
          <div>
            <label className="field-label">Date de début *</label>
            <input type="date" name="date_debut" required />
          </div>
          <div>
            <label className="field-label">Date de fin *</label>
            <input type="date" name="date_fin" required />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">
            Personne de contact sur place <span className="optional-tag">(si différente de vous)</span>
          </label>
          <input type="text" name="contact_sur_place" placeholder="Nom, prénom et téléphone" />
        </div>
      </div>

      <div className="inv-form-section">
        <h2>Informations complémentaires</h2>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Prévoyez-vous de couvrir les frais de voyage et d&apos;hébergement ? *</label>
          <div className="radio-row">
            <label>
              <input type="radio" name="frais_couverts" value="Oui" required /> Oui
            </label>
            <label>
              <input type="radio" name="frais_couverts" value="Non" required /> Non
            </label>
            <label>
              <input type="radio" name="frais_couverts" value="À discuter" required /> À discuter
            </label>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">
            Comment avez-vous connu Serge Hapita Ministries ? <span className="optional-tag">(facultatif)</span>
          </label>
          <input type="text" name="comment_connu" />
        </div>
        <div>
          <label className="field-label">
            Message à ajouter <span className="optional-tag">(facultatif)</span>
          </label>
          <textarea name="message" />
        </div>
      </div>

      <label className="consent-label">
        <input type="checkbox" required />
        <span>
          En envoyant votre demande, vous acceptez nos{" "}
          <a href="/termes-et-conditions" style={{ color: "var(--purple)" }}>
            conditions
          </a>
          , que nous vous invitons à lire avant.
        </span>
      </label>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={isPending}>
        {isPending ? "Envoi…" : "Envoyer →"}
      </button>
    </form>
  );
}
