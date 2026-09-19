# Activation OAuth Google et Meta

Les identifiants OAuth ne sont pas encore créés. Ils doivent appartenir à Serge Hapita Ministries, pas à un prestataire ni à un compte personnel du développeur.

## Adresse de rappel commune

À déclarer chez Google et chez Meta :

`https://rflwfxohjikmlvsdybdq.supabase.co/auth/v1/callback`

## Google

1. Dans Google Cloud Console, choisir ou créer un projet appartenant à l'organisation.
2. Configurer l'écran de consentement avec le nom et les coordonnées de Serge Hapita Ministries.
3. Créer un client OAuth 2.0 de type « Application Web ».
4. Ajouter l'adresse de rappel ci-dessus aux URI de redirection autorisés.
5. Copier le Client ID et le Client Secret dans Supabase : Authentication → Providers → Google.

## Meta / Facebook

1. Dans Meta for Developers, créer une application de type « Consumer » appartenant à l'organisation.
2. Ajouter le produit Facebook Login et renseigner le domaine `sergehapitaministries.org`.
3. Ajouter l'adresse de rappel ci-dessus aux URI de redirection OAuth valides.
4. Renseigner les liens publics de confidentialité et de suppression des données du site.
5. Copier l'App ID et l'App Secret dans Supabase : Authentication → Providers → Facebook.
6. Passer l'application Meta en mode Live après validation des informations obligatoires.

## Supabase et Vercel

Dans Supabase Authentication → URL Configuration :

- Site URL : `https://sergehapitaministries.org`
- Redirect URL de production : `https://sergehapitaministries.org/auth/callback`
- Ajouter séparément l'URL de préproduction utilisée pour le test OAuth.

Après le test réussi, activer les boutons avec les variables Vercel suivantes :

- `OAUTH_GOOGLE_ENABLED=true`
- `OAUTH_FACEBOOK_ENABLED=true`

Ne jamais enregistrer les secrets Google ou Meta dans GitHub, dans une variable `NEXT_PUBLIC_*` ou dans le navigateur.
