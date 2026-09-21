-- À appliquer immédiatement APRÈS le déploiement de l'application protégée.
-- L'appliquer avant casserait les formulaires encore servis par l'ancienne
-- version, qui utilisent les droits publics d'insertion.

drop policy if exists "Envoi public du formulaire de contact"
  on public.contact_submissions;
drop policy if exists "Envoi public du formulaire d'invitation"
  on public.invitation_submissions;
drop policy if exists "Envoi public de la prière du salut"
  on public.prayer_submissions;
drop policy if exists "Tout le monde peut soumettre un avis"
  on public.reviews;

revoke insert on table public.contact_submissions from anon, authenticated;
revoke insert on table public.invitation_submissions from anon, authenticated;
revoke insert on table public.prayer_submissions from anon, authenticated;
revoke insert on table public.reviews from anon, authenticated;

grant insert on table public.contact_submissions to service_role;
grant insert on table public.invitation_submissions to service_role;
grant insert on table public.prayer_submissions to service_role;
grant insert on table public.reviews to service_role;
