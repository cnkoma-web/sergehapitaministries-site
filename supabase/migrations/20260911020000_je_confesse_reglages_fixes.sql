-- V2 Lot 4 — correction du 11/09, après relecture de la maquette par Serge.
-- Le verset d'en-tête (Proverbes 18:20) et la signature de clôture
-- (Romains 10:10) de la rubrique Je Confesse sont FIXES pour toute la
-- rubrique, jamais un champ par proclamation (contrairement à ce qu'une
-- première version de ce lot avait supposé à tort). Réglages globaux,
-- rangés dans interface_texts comme les autres libellés du site
-- (éditables dans /admin/textes) — on conflict do nothing : n'écrase rien
-- si Serge a déjà personnalisé une de ces clés d'ici l'exécution.

insert into public.interface_texts (key, value) values
  ('je_confesse.verse_text', 'C''est du fruit de sa bouche que l''homme rassasie son ventre, c''est du produit de ses lèvres qu''il se rassasie.'),
  ('je_confesse.verse_reference', 'Proverbes 18:20'),
  ('je_confesse.signature_text', 'Ayez l''audace de dire les mêmes choses que Dieu a dites à votre sujet dans sa Parole. C''est ce qui vous fait jouir des bienfaits du salut. C''est en confessant de la bouche ce que l''on croit du cœur que l''on parvient au salut.'),
  ('je_confesse.signature_reference', 'Romains 10:10')
on conflict (key) do nothing;
