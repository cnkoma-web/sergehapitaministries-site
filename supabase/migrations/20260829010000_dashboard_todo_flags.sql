-- Cahier Partie 5 §6.8 : le bloc "À traiter" du tableau de bord a besoin de
-- savoir ce qui n'a pas encore été vu/traité par Serge — ces deux colonnes
-- n'existaient pas encore (les avis en attente et les paiements échoués se
-- déduisent déjà de colonnes existantes, pas besoin d'ajout pour eux).

alter table public.orders add column shipped boolean not null default false;
alter table public.contact_submissions add column read boolean not null default false;
alter table public.invitation_submissions add column handled boolean not null default false;
