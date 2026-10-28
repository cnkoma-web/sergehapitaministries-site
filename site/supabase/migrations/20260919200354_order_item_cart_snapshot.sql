alter table public.order_items
  add column if not exists source_cart_item_id uuid;

create or replace function public.create_checkout_order(
  p_user_id uuid,
  p_customer_email text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_subtotal bigint;
begin
  if p_user_id is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'invalid checkout payload';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      source_cart_item_id uuid,
      book_id uuid,
      goodie_id uuid,
      title_snapshot text,
      unit_price_cents integer,
      quantity integer,
      variant_size text,
      variant_color text
    )
    where item.source_cart_item_id is null
       or item.title_snapshot is null
       or item.unit_price_cents is null
       or item.unit_price_cents < 0
       or item.quantity is null
       or item.quantity < 1
       or ((item.book_id is null) = (item.goodie_id is null))
  ) then
    raise exception 'invalid checkout item';
  end if;

  select sum(item.unit_price_cents::bigint * item.quantity::bigint)
  into v_subtotal
  from jsonb_to_recordset(p_items) as item(
    unit_price_cents integer,
    quantity integer
  );

  if v_subtotal < 0 or v_subtotal > 2147483647 then
    raise exception 'checkout total out of range';
  end if;

  insert into public.orders (
    user_id, status, subtotal_cents, total_cents, customer_email
  )
  values (
    p_user_id, 'pending', v_subtotal::integer,
    v_subtotal::integer, nullif(p_customer_email, '')
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id, source_cart_item_id, book_id, goodie_id, title_snapshot,
    unit_price_cents, quantity, variant_size, variant_color
  )
  select
    v_order_id, item.source_cart_item_id, item.book_id, item.goodie_id,
    item.title_snapshot, item.unit_price_cents, item.quantity,
    item.variant_size, item.variant_color
  from jsonb_to_recordset(p_items) as item(
    source_cart_item_id uuid,
    book_id uuid,
    goodie_id uuid,
    title_snapshot text,
    unit_price_cents integer,
    quantity integer,
    variant_size text,
    variant_color text
  );

  return v_order_id;
end;
$$;

revoke all on function public.create_checkout_order(uuid, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_checkout_order(uuid, text, jsonb)
  to service_role;
