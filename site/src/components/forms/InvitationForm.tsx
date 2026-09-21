"use client";

import { useTransition } from "react";
import { submitInvitationForm } from "@/lib/forms/actions";
import BotTrapFields from "@/components/security/BotTrapFields";
import TurnstileWidget from "@/components/security/TurnstileWidget";

export default function InvitationForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="invitation-form"
      action={(formData) => {
        startTransition(() => submitInvitationForm(formData));
      }}
    >
      {/* RECTIFICATION (14/09, 2e retour) : la reprise précédente avait
          supprimé la colonne 190px et les repères 01/02/03 — mauvaise
          lecture de la demande, jamais validée. Structure RESTAURÉE à
          l'identique d'avant cette suppression (pastille <span> + colonne,
          "form-fields" comme seul enfant réel de la 2e colonne de la grille
          .inv-form-section, cf. globals.css). Seule la typographie du <h2>
          est allégée (voir globals.css), pas sa position ni son repère. */}
      <div className="inv-form-section">
        <div className="form-section-heading">
          <span>01</span>
          <h2>Vos coordonnées</h2>
        </div>
        <div className="form-fields">
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
      </div>

      <div className="inv-form-section">
        <div className="form-section-heading">
          <span>02</span>
          <h2>Votre structure</h2>
        </div>
        <div className="form-fields">
          <div>
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
      </div>

      <div className="inv-form-section">
        <div className="form-section-heading">
          <span>03</span>
          <h2>L’événement</h2>
        </div>
        <div className="form-fields">
          <div className="inv-row">
            <div>
              <label className="field-label">Type d’invitation *</label>
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
          <div>
            <label className="field-label">Thème de l’événement *</label>
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
          <div>
            <label className="field-label">
              Personne de contact sur place <span className="optional-tag">(si différente de vous)</span>
            </label>
            <input type="text" name="contact_sur_place" placeholder="Nom, prénom et téléphone" />
          </div>
        </div>
      </div>

      <div className="inv-form-section">
        <div className="form-section-heading">
          <span>04</span>
          <h2>Compléments d&apos;infos</h2>
        </div>
        <div className="form-fields">
          <div className="field">
            <span className="field-label">Prévoyez-vous de couvrir les frais de voyage et d’hébergement ? *</span>
            <div className="radio-group">
              <label className="radio-option">
                <input type="radio" name="frais_couverts" value="Oui" required /> Oui
              </label>
              <label className="radio-option">
                <input type="radio" name="frais_couverts" value="Non" /> Non
              </label>
              <label className="radio-option">
                <input type="radio" name="frais_couverts" value="À discuter" /> À discuter
              </label>
            </div>
          </div>
          <div>
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
      </div>

      {/* "inv-submit-row" (certification 14/09) : la maquette (§
          .form-submit-row) porte un padding asymétrique 30px 48px 38px
          284px (aligné sur les colonnes de champs, 190+46+48), un filet
          supérieur et un fond #fbfaff distinct du reste du formulaire —
          le style inline précédent (padding:"0 48px 42px") n'avait ni
          l'alignement, ni le filet, ni le fond. */}
      <div className="inv-submit-row">
        <label className="consent-label">
          <input type="checkbox" required />
          <span>
            En envoyant votre demande, vous acceptez nos{" "}
            <a href="/termes-et-conditions">conditions</a>, que nous vous invitons à lire avant.
          </span>
        </label>

        <BotTrapFields />
        <TurnstileWidget action="invitation" />

        <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={isPending}>
          {isPending ? "Envoi…" : "Envoyer la demande →"}
        </button>
      </div>
    </form>
  );
}
