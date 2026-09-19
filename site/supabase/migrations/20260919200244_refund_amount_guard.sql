alter table public.orders
  add constraint orders_refunded_not_above_total_check
  check (refunded_cents is null or refunded_cents <= total_cents);
