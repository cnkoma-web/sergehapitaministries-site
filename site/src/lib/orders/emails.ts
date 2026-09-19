import { formatPrice } from "@/lib/format";
import { renderEmail, EMAIL_INK, EMAIL_PURPLE } from "@/lib/email/template";
import { shortOrderReference } from "./fulfillment";

type OrderEmailItem = { title_snapshot: string; quantity: number; unit_price_cents: number };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderOrderConfirmationEmail({
  orderId,
  items,
  shippingCents,
  totalCents,
}: {
  orderId: string;
  items: OrderEmailItem[];
  shippingCents: number;
  totalCents: number;
}): string {
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:7px 0;">${escapeHtml(item.title_snapshot)} × ${item.quantity}</td><td style="padding:7px 0;text-align:right;">${formatPrice(item.unit_price_cents * item.quantity)}</td></tr>`
    )
    .join("");

  return renderEmail(
    `<h1 style="margin:0 0 8px;font-size:22px;color:${EMAIL_INK};">Merci pour votre commande</h1>
     <p style="margin:0 0 18px;color:#4A4560;">Commande n° ${shortOrderReference(orderId)}</p>
     <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}
       <tr><td style="padding:9px 0;border-top:1px solid #E4E0F0;">Livraison</td><td style="padding:9px 0;border-top:1px solid #E4E0F0;text-align:right;">${shippingCents === 0 ? "Offerte" : formatPrice(shippingCents)}</td></tr>
       <tr style="font-weight:bold;"><td style="padding:9px 0;">Total</td><td style="padding:9px 0;text-align:right;">${formatPrice(totalCents)}</td></tr>
     </table>
     <p>Le traitement de votre commande est maintenant visible dans votre espace « Mon compte ».</p>
     <p><a href="https://sergehapitaministries.org/mon-compte?section=commandes" style="color:${EMAIL_PURPLE};font-weight:700;text-decoration:none;">Voir ma commande →</a></p>`
  );
}

export function renderOrderProgressEmail({
  orderId,
  delivered,
  carrier,
  trackingNumber,
  trackingUrl,
}: {
  orderId: string;
  delivered: boolean;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}): string {
  const tracking = delivered
    ? ""
    : `<p style="margin:18px 0 0;"><strong>Transporteur :</strong> ${escapeHtml(carrier || "Non précisé")}<br /><strong>Numéro de suivi :</strong> ${escapeHtml(trackingNumber || "Non précisé")}</p>
       ${trackingUrl ? `<p><a href="${escapeHtml(trackingUrl)}" style="color:${EMAIL_PURPLE};font-weight:700;text-decoration:none;">Suivre mon colis →</a></p>` : ""}`;

  return renderEmail(
    `<h1 style="margin:0 0 8px;font-size:22px;color:${EMAIL_INK};">${delivered ? "Votre commande est indiquée comme livrée" : "Votre commande a été expédiée"}</h1>
     <p style="margin:0 0 18px;color:#4A4560;">Commande n° ${shortOrderReference(orderId)}</p>
     <p>${delivered ? "La livraison de votre commande est maintenant enregistrée." : "Votre colis a quitté notre service d’expédition."}</p>
     ${tracking}
     <p><a href="https://sergehapitaministries.org/mon-compte?section=commandes" style="color:${EMAIL_PURPLE};font-weight:700;text-decoration:none;">Consulter ma commande →</a></p>`
  );
}
