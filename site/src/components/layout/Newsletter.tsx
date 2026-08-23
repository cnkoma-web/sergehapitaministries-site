// Bloc newsletter "ParoleDeViePourVous". Un seul champ (email) + consentement RGPD —
// jamais de champ Nom/Ville en plus (cahier §1.2). Présent sur 15 des 23 pages.
//
// ⚠️ Phase 1 : la soumission n'est pas encore branchée (arrivera en Phase 6, envoi réel
// vers MailerLite). Pour l'instant, comportement honnête : pas de fausse redirection.
export default function Newsletter() {
  return (
    <div className="newsletter" id="newsletter">
      <div className="wrap">
        <h2>ParoleDeViePourVous</h2>
        <p>
          Recevez chaque semaine les nouvelles parutions et les publications de Serge Hapita,
          directement dans votre boîte mail.
        </p>
        <form className="newsletter-form">
          <input type="email" name="email" placeholder="Votre adresse e-mail" required />
          <button type="submit">S&apos;abonner →</button>
        </form>
        <label className="consent">
          <input type="checkbox" required />
          <span>J&apos;accepte de recevoir les communications par e-mail (RGPD)</span>
        </label>
        <div className="fine">Aucun spam · Désabonnement en 1 clic</div>
      </div>
    </div>
  );
}
