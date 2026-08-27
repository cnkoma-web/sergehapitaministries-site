-- Ajoute le montant de livraison réellement facturé par Stripe (dépend de
-- l'option choisie par le client — France métropolitaine ou International,
-- voir site/src/lib/stripe/shipping.ts) — renseigné par le webhook, jamais
-- par le navigateur.
alter table public.orders add column shipping_cents integer not null default 0;
