-- Les formulaires protégés passent désormais exclusivement par les actions
-- serveur après Turnstile, validation et limitation de fréquence. Ce droit
-- est ajouté avant la fermeture différée des anciennes insertions publiques.
grant insert on table public.contact_submissions to service_role;
grant insert on table public.invitation_submissions to service_role;
grant insert on table public.prayer_submissions to service_role;
grant insert on table public.reviews to service_role;
