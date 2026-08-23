import { Fragment } from "react";
import { getTickerMessages } from "@/lib/content/ticker";

// Bandeau ticker défilant. Le défilement CSS en boucle continue exige de dupliquer une fois
// la liste de messages dans le DOM (détail de rendu — voir cahier §1.2 / exploration §3.9) ;
// une seule liste de messages est ce qui doit être piloté depuis le CMS en Phase 2.
export default function Topbar() {
  const messages = getTickerMessages();
  const track = [...messages, ...messages];

  return (
    <div className="topbar">
      <div className="topbar-track">
        {track.map((msg, i) => (
          <Fragment key={i}>
            <span>{msg.href ? <a href={msg.href}>{msg.text}</a> : msg.text}</span>
            {i < track.length - 1 && <span>◆</span>}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
