// Habillage visuel commun des e-mails transactionnels (retour du 05/09,
// point 3) — jusqu'ici sendCustomerEmail() recevait un fragment HTML brut
// (juste des <p>), envoyé tel quel : aucun en-tête, aucune couleur, aucune
// mise en page. Construit ici une seule fois, réutilisable pour n'importe
// quel e-mail client (pour l'instant : confirmation de don).
//
// Mise en page en tables + styles inline (pas de <style> externe, pas de
// flexbox/grid) : c'est la seule approche qui s'affiche correctement dans
// la plupart des clients mail (Gmail, Outlook, Apple Mail...), qui ignorent
// ou suppriment le CSS moderne. Polices web-safe uniquement — une police
// chargée depuis Google Fonts ne se charge pas de façon fiable dans un
// e-mail, contrairement à une page web.
const LOGO_URL = "https://sergehapitaministries.org/logo.png";
// Exportées pour que le contenu de chaque e-mail (couleur d'un titre, etc.)
// reste cohérent avec l'habillage sans dupliquer ces valeurs ailleurs.
export const EMAIL_INK = "#1B1730";
export const EMAIL_PURPLE = "#7B3FE4";
const INK = EMAIL_INK;
const INK_SOFT = "#4A4560";
const PURPLE = EMAIL_PURPLE;
const PAPER = "#FCFBFF";
const LINE = "#E4E0F0";

// V2 Lot 10 (11/09) — habillage repris tel quel de DOSSIER-INTERFACE-
// SERGE-HAPITA-MINISTRIES/gabarits-emails/*.html (les 3 gabarits fournis
// partagent exactement cette structure : en-tête dégradé encre→violet avec
// le logo blanc, eyebrow violet en petites capsules, titre Georgia, corps,
// pied de page discret). Distinct de renderEmail() ci-dessus (habillage
// "carte blanche" déjà en usage pour les e-mails Stripe) — les deux
// coexistent, celui-ci sert uniquement aux gabarits explicitement fournis
// par la maquette pour ce lot, jamais pour reskinner les e-mails Stripe non
// concernés par ce lot.
export function renderGabaritEmail({ eyebrow, title, bodyHtml }: { eyebrow: string; title: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#f4f1fb;font-family:Arial,sans-serif;color:#17142d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1fb;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:14px;overflow:hidden"><tr><td align="center" style="padding:34px 24px;background:linear-gradient(135deg,#17142d,#6d31f2)"><img src="https://sergehapitaministries.org/logo-white.png" width="230" alt="Serge Hapita Ministries" style="display:block;max-width:75%;height:auto"></td></tr><tr><td style="padding:38px 34px"><p style="margin:0 0 10px;color:#6d31f2;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em">${eyebrow}</p><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:32px;line-height:1.15">${title}</h1>${bodyHtml}</td></tr></table></td></tr></table></body></html>`;
}

export function renderEmail(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:${PAPER};font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:14px;overflow:hidden;">
            <tr>
              <td style="height:4px;line-height:4px;font-size:0;background:${PURPLE};" colspan="1">&nbsp;</td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 24px;border-bottom:1px solid ${LINE};">
                <img src="${LOGO_URL}" alt="Serge Hapita Ministries" width="180" style="display:block;max-width:180px;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px;color:${INK};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 28px;">
                <div style="height:1px;background:${LINE};margin-bottom:20px;"></div>
                <p style="margin:0;font-size:12.5px;color:${INK_SOFT};line-height:1.6;">
                  Serge Hapita Ministries — Levallois-Perret, France<br />
                  <a href="https://sergehapitaministries.org" style="color:${PURPLE};text-decoration:none;">sergehapitaministries.org</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
