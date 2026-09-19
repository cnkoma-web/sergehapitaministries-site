-- Phase A : extension additive et compatible avec le code actuellement en
-- production. La fermeture des écritures clientes est volontairement séparée
-- dans la migration suivante, à appliquer seulement après le déploiement.
begin;

alter table public.orders
  add column if not exists paid_at timestamptz,
  add column if not exists payment_failed_at timestamptz,
  add column if not exists refunded_at timestamptz,
  add column if not exists refunded_cents integer,
  add column if not exists fulfillment_status text,
  add column if not exists fulfillment_updated_at timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists preparing_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists tracking_carrier text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists shipping_recipient_name text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_address jsonb,
  add column if not exists confirmation_email_sent_at timestamptz,
  add column if not exists shipping_email_sent_at timestamptz,
  add column if not exists delivery_email_sent_at timestamptz;

update public.orders
set
  paid_at = case when status in ('paid', 'refunded') then coalesce(paid_at, updated_at, created_at) else paid_at end,
  payment_failed_at = case when status = 'failed' then coalesce(payment_failed_at, updated_at, created_at) else payment_failed_at end,
  refunded_at = case when status = 'refunded' then coalesce(refunded_at, updated_at, created_at) else refunded_at end,
  fulfillment_status = case
    when shipped then 'shipped'
    when status = 'paid' then 'confirmed'
    else null
  end,
  fulfillment_updated_at = case
    when shipped or status = 'paid' then coalesce(updated_at, created_at)
    else null
  end,
  confirmed_at = case
    when shipped or status = 'paid' then coalesce(updated_at, created_at)
    else null
  end,
  preparing_at = case when shipped then coalesce(updated_at, created_at) else null end,
  shipped_at = case when shipped then coalesce(updated_at, created_at) else null end
where fulfillment_status is null;

alter table public.orders
  add constraint orders_fulfillment_status_check
    check (fulfillment_status is null or fulfillment_status in ('confirmed', 'preparing', 'shipped', 'delivered')),
  add constraint orders_fulfillment_requires_payment_check
    check (fulfillment_status is null or status in ('paid', 'refunded')),
  add constraint orders_shipped_consistency_check
    check (shipped = coalesce(fulfillment_status in ('shipped', 'delivered'), false)),
  add constraint orders_shipping_address_object_check
    check (shipping_address is null or jsonb_typeof(shipping_address) = 'object'),
  add constraint orders_tracking_url_check
    check (tracking_url is null or tracking_url ~* '^https?://[^[:space:]]+$'),
  add constraint orders_preparing_timeline_check
    check (preparing_at is null or (confirmed_at is not null and preparing_at >= confirmed_at)),
  add constraint orders_shipped_timeline_check
    check (shipped_at is null or (confirmed_at is not null and shipped_at >= confirmed_at)),
  add constraint orders_delivered_timeline_check
    check (delivered_at is null or (shipped_at is not null and delivered_at >= shipped_at)),
  add constraint orders_confirmation_email_status_check
    check (confirmation_email_sent_at is null or status in ('paid', 'refunded')),
  add constraint orders_shipping_email_status_check
    check (shipping_email_sent_at is null or shipped_at is not null),
  add constraint orders_delivery_email_status_check
    check (delivery_email_sent_at is null or delivered_at is not null),
  add constraint orders_amounts_nonnegative_check
    check (subtotal_cents >= 0 and shipping_cents >= 0 and total_cents >= 0 and coalesce(refunded_cents, 0) >= 0);

alter table public.order_items
  add constraint order_items_quantity_positive_check check (quantity > 0),
  add constraint order_items_price_nonnegative_check check (unit_price_cents >= 0),
  add constraint order_items_one_product_check check ((book_id is null) <> (goodie_id is null));

create unique index if not exists orders_stripe_payment_intent_id_key
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists orders_paid_fulfillment_queue_idx
  on public.orders (fulfillment_status, created_at)
  where status = 'paid';

create or replace function public.sync_order_fulfillment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.shipped and new.fulfillment_status is null then
      new.fulfillment_status := 'shipped';
    end if;
  elsif new.fulfillment_status is not distinct from old.fulfillment_status
        and new.shipped is distinct from old.shipped then
    if new.shipped then
      new.fulfillment_status := 'shipped';
    elsif old.shipped and new.fulfillment_status in ('shipped', 'delivered') then
      new.fulfillment_status := 'confirmed';
    end if;
  end if;

  if tg_op = 'INSERT'
     or new.fulfillment_status is distinct from old.fulfillment_status then
    if new.fulfillment_status is not null
       and new.status not in ('paid', 'refunded') then
      raise exception 'Un suivi logistique exige une commande payée.'
        using errcode = '23514';
    end if;

    new.fulfillment_updated_at := case
      when new.fulfillment_status is null then null
      else now()
    end;

    case new.fulfillment_status
      when 'confirmed' then
        new.confirmed_at := coalesce(new.confirmed_at, now());
      when 'preparing' then
        new.confirmed_at := coalesce(new.confirmed_at, now());
        new.preparing_at := coalesce(new.preparing_at, now());
      when 'shipped' then
        new.confirmed_at := coalesce(new.confirmed_at, now());
        new.preparing_at := coalesce(new.preparing_at, now());
        new.shipped_at := coalesce(new.shipped_at, now());
      when 'delivered' then
        new.confirmed_at := coalesce(new.confirmed_at, now());
        new.preparing_at := coalesce(new.preparing_at, now());
        new.shipped_at := coalesce(new.shipped_at, now());
        new.delivered_at := coalesce(new.delivered_at, now());
      else
        null;
    end case;
  end if;

  new.shipped := coalesce(new.fulfillment_status in ('shipped', 'delivered'), false);
  return new;
end;
$$;

revoke execute on function public.sync_order_fulfillment() from public, anon, authenticated;

drop trigger if exists sync_order_fulfillment on public.orders;
create trigger sync_order_fulfillment
  before insert or update on public.orders
  for each row execute function public.sync_order_fulfillment();

-- Ces droits explicites sont indispensables : BYPASSRLS ne remplace pas les
-- privilèges SQL de table et ils manquaient sur la base existante.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.orders to service_role;
grant select, insert on table public.order_items to service_role;
grant select on table public.carts to service_role;
grant delete on table public.cart_items to service_role;
grant select, update on table public.donations to service_role;

comment on column public.orders.fulfillment_status is
  'Statut logistique distinct du statut de paiement : confirmed, preparing, shipped, delivered.';
comment on column public.orders.shipping_address is
  'Instantané JSON de l’adresse de livraison confirmée par Stripe.';

commit;
