-- Une commande garde l'identité anonyme qui a initié le checkout dans
-- user_id. account_user_id ajoute uniquement le compte permanent dans lequel
-- elle doit apparaître après une connexion à un compte déjà existant.
alter table public.orders
  add column if not exists account_user_id uuid references auth.users(id) on delete set null,
  add column if not exists account_linked_at timestamptz;

create index if not exists orders_account_user_id_idx
  on public.orders (account_user_id)
  where account_user_id is not null;

drop policy if exists "Un utilisateur lit ses propres commandes" on public.orders;
create policy "Un utilisateur lit ses propres commandes"
  on public.orders
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select auth.uid()) = account_user_id
  );

drop policy if exists "Un utilisateur lit les lignes de ses propres commandes" on public.order_items;
create policy "Un utilisateur lit les lignes de ses propres commandes"
  on public.order_items
  for select
  to authenticated
  using (
    order_id in (
      select orders.id
      from public.orders
      where (select auth.uid()) = orders.user_id
         or (select auth.uid()) = orders.account_user_id
    )
  );

-- L'article possède déjà neuf intertitres éditoriaux. Ils alimentent la
-- section historique « Ce que la suite aborde », sans bloquer la publication
-- si cette liste reste vide sur un autre article.
update public.articles
set toc_keywords = array[
  'Toute forteresse commence par une pensée à laquelle on a permis de devenir une image intérieure',
  'Ce qui s’élève contre la connaissance de Dieu',
  'Renverser exige une réponse',
  'Amener toute pensée captive',
  'Le renouvellement de l’intelligence',
  'Parler conformément à ce que Dieu montre',
  'Une nouvelle manière de vivre',
  'Mettre ses armes en action chaque jour',
  'Refuse de laisser une autre voix écrire ton avenir'
]
where slug = 'nouvel-article-61cdg'
  and type = 'vs'
  and cardinality(toc_keywords) = 0;
