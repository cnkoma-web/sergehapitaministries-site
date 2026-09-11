import { Fragment } from "react";
import { getTickerMessages } from "@/lib/content/ticker";

// V2 (retour du 11/09, Lot 1) — écart assumé et validé avec Serge par
// rapport au prototype : celui-ci ne montre plus qu'un seul lien fixe
// ("Recevez « ParoleDeViePourVous »…") à la place de ce bandeau. La
// fonctionnalité existante (liste illimitée, réordonnable, activable/
// désactivable depuis /admin/ticker) est conservée intégralement — seul
// l'habillage visuel change (couleurs/polices de la nouvelle interface).
// "Recevez ParoleDeViePourVous…" redevient un message du ticker comme un
// autre, piloté depuis l'admin, jamais recodé en dur ici.
//
// 3 cas gérés explicitement, comme demandé :
// - 0 message actif : rien n'est rendu ici ; .v2-network-inner (voir
//   (site)/layout.tsx), en justify-content:space-between, ne casse pas sa
//   mise en page pour autant — les liens partenaires (BrandSplit) occupent
//   alors seuls la bande, sans espace vide visible ou cassé.
// - 1 message actif : affiché fixe, sans dupliquer la liste ni animer.
// - 2+ messages actifs : défilement en boucle continue (liste dupliquée
//   une fois, même technique que l'ancien .topbar-track).
export default async function Topbar() {
  const messages = await getTickerMessages();
  if (messages.length === 0) return null;

  const scrolling = messages.length > 1;
  const track = scrolling ? [...messages, ...messages] : messages;

  return (
    <div className={`v2-ticker${scrolling ? " is-scrolling" : ""}`}>
      <div className="v2-ticker-track">
        {track.map((msg, i) => (
          <Fragment key={i}>
            <span>{msg.href ? <a href={msg.href}>{msg.text}</a> : msg.text}</span>
            {i < track.length - 1 && <span aria-hidden="true">◆</span>}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
