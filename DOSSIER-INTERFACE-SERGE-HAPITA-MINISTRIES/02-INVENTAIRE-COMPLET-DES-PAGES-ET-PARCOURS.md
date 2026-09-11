# Inventaire complet des pages et parcours

**État arrêté au 10 septembre 2026**  
**Objet : donner à Claude et Claude Code un comptage exact des écrans dessinés, des traitements à raccorder et des routes dynamiques.**

## 1. Correction du comptage

Le premier dossier contenait 21 écrans HTML. Ce nombre ne représentait pas le site complet : la Boutique, les pages légales, la confirmation et les états intermédiaires du compte n’avaient pas encore reçu de maquette.

Le dossier corrigé contient maintenant **35 écrans HTML prototypés** :

- 21 écrans issus du travail précédent ;
- 7 écrans pour la Boutique, la fiche produit, la confirmation et les pages légales ;
- 7 écrans pour le parcours de création/récupération du compte.

Ce nombre reste celui des **gabarits visuels présents dans le dossier**, pas celui des URL finales du site. Les articles, livres, produits, podcasts, Rosées Matinales, confessions et futurs repères de Jésus produisent des routes dynamiques supplémentaires.

## 2. Les 21 écrans éditoriaux et fonctionnels déjà présents

| Route du prototype | Rôle |
|---|---|
| `/` | Accueil |
| `/de-serge/` | À propos de Serge |
| `/mission/` | La mission |
| `/connaitre-jesus/` | Connaître Jésus |
| `/publications/` | Hub général Publications |
| `/publications/que-dit-la-bible/` | Hub Que dit la Bible ? |
| `/publications/la-vie-superieure/` | Hub La Vie Supérieure |
| `/publications/nouvel-article-ozsqc/` | Exemple d’article Que dit la Bible ? |
| `/publications/nouvel-article-61cdg/` | Exemple d’article La Vie Supérieure |
| `/rosee-matinale/` | Rosée Matinale du jour et archives |
| `/publications/je-confesse-et-declare/` | Je Confesse du jour et archives |
| `/livres/` | Catalogue des livres |
| `/livres/manifester-ce-que-dieu-a-prevu/` | Exemple de fiche livre |
| `/panier/` | Panier |
| `/compte/` | Connexion et inscription |
| `/mon-compte/` | Espace personnel |
| `/invitation/` | Inviter Serge |
| `/partenariat/` | Partenariat / Soutenir |
| `/podcast/` | Bibliothèque Podcast |
| `/videos/` | Vidéos |
| `/contact/` | Contact |

## 3. Les 7 écrans Boutique, vente et informations légales ajoutés

| Route du prototype | Rôle et règle à conserver |
|---|---|
| `/boutique/` | Hub des produits dérivés uniquement ; les livres restent dans `/livres/`. Les huit produits transmis sont présents et restent annoncés `Bientôt disponible`. |
| `/boutique/t-shirt-voix-prophetique/` | Exemple de gabarit produit. En production, utiliser une route dynamique de type `/produit/[slug]` ou préserver la route déjà utilisée par l’application. |
| `/confirmation/?type=…` | Page adaptative pour `contact`, `invitation`, `don`, `avis`, `newsletter` et `commande`. |
| `/mentions-legales/` | Mentions légales reliées au pied de page. |
| `/politique-de-confidentialite/` | Politique de confidentialité reliée au pied de page. |
| `/politique-de-cookies/` | Politique de cookies reliée au pied de page. |
| `/termes-et-conditions/` | Termes et conditions reliés au pied de page. |

Les quatre textes juridiques correspondent aux contenus transmis le 10 septembre 2026 et sont intégrés sans réécriture. Ils comprennent désormais le SIRET, les prestataires de données, Google Analytics, les délais de livraison, les retours et le remboursement. La date de mise à jour doit encore être renseignée lors de la mise en ligne définitive.

## 4. Les 7 écrans du parcours Compte ajoutés

| Route du prototype | État représenté | Raccordement attendu |
|---|---|---|
| `/compte/verification-email/` | Après inscription : vérifier sa messagerie et renvoyer l’e-mail | Supabase Auth : confirmation d’inscription |
| `/compte/mot-de-passe-oublie/` | Saisie de l’adresse e-mail | Supabase : demande de récupération |
| `/compte/email-envoye/` | Réponse neutre après la demande | Ne pas révéler si l’adresse existe |
| `/auth/confirm/` | Validation technique du lien reçu | Échange unique du jeton contre une session côté serveur |
| `/compte/nouveau-mot-de-passe/` | Nouveau mot de passe + confirmation | Mise à jour sécurisée par Supabase |
| `/compte/mot-de-passe-modifie/` | Succès de la réinitialisation | Retour vers la connexion |
| `/compte/compte-active/` | Adresse e-mail confirmée | Connexion ou redirection selon le fonctionnement réel |

La route `/auth/confirm/?error=…` montre aussi l’état `lien expiré ou déjà utilisé` et propose de demander un nouveau lien.

### Parcours d’inscription

1. L’utilisateur remplit `/compte/?tab=signup` ou choisit Google/Facebook.
2. Supabase crée le compte et envoie l’e-mail de vérification.
3. Le site affiche `/compte/verification-email/`.
4. Le clic dans l’e-mail arrive sur `/auth/confirm/`.
5. La route vérifie le jeton une seule fois, puis conduit vers `/compte/compte-active/` ou connecte l’utilisateur selon la règle finale.

### Parcours de mot de passe oublié

1. Le lien `Mot de passe oublié ?` ouvre `/compte/mot-de-passe-oublie/`.
2. Après la demande, le site affiche `/compte/email-envoye/`.
3. L’e-mail de réinitialisation conduit à `/auth/confirm/`.
4. La route échange le jeton de récupération une seule fois contre une session valide.
5. L’utilisateur crée son mot de passe sur `/compte/nouveau-mot-de-passe/`.
6. Le succès s’affiche sur `/compte/mot-de-passe-modifie/`, avec retour vers la connexion.

**Règle technique critique :** ne pas afficher directement le formulaire de nouveau mot de passe à partir du jeton reçu dans l’URL. La route `/auth/confirm` doit d’abord consommer le jeton et établir la session de récupération, conformément au §11.6 du cahier des charges v4.

## 5. E-mails transactionnels : ce ne sont pas des pages

Le dossier `gabarits-emails/` contient trois références visuelles à raccorder aux systèmes existants :

- `verification-compte.html` — e-mail de confirmation de l’adresse ;
- `reinitialisation-mot-de-passe.html` — e-mail de récupération ;
- `accuse-reception-contact.html` — accusé de réception après le formulaire Contact.

Supabase gère l’authentification et les liens de vérification/récupération. Resend reste responsable des e-mails transactionnels du site. MailerLite reste responsable de la newsletter.

Les autres gabarits à vérifier dans le code actuel sont : confirmation de commande, accusé de réception d’invitation, confirmation de don et notification d’avis validé. Leur fonctionnement ne doit pas être recréé s’il existe déjà ; il doit seulement recevoir l’identité visuelle validée.

## 6. Page sur le site et e-mail de retour

Après l’envoi d’un formulaire, deux réponses distinctes peuvent exister :

1. une page sur le site, par exemple `/confirmation/?type=contact` ;
2. un e-mail de réception envoyé au visiteur et/ou une notification à l’administrateur.

L’une ne remplace pas l’autre. Claude doit vérifier le code réel de chaque formulaire avant de raccorder la nouvelle interface.

## 7. Espace personnel

Le prototype `/mon-compte/` représente le tableau de bord. Le développement final doit conserver les états réels de chaque espace :

- commandes : chargement, vide, liste, détail et erreur ;
- profil : consultation, modification, validation et succès ;
- accès La Vie Supérieure : actif, inactif, contenu disponible et téléchargement PDF ;
- avis : vide, en attente, validé ou refusé ;
- déconnexion : fin de session puis retour vers la connexion.

## 8. Routes dynamiques et futures pages

Les 35 écrans ne comptent pas séparément chaque contenu dynamique :

- `/livres/[slug]` : une URL par livre ;
- `/produit/[slug]` : une URL par produit ;
- articles Que dit la Bible ? et La Vie Supérieure : une URL par publication ;
- Rosée Matinale et Je Confesse : page du jour, archives et navigation par date selon l’architecture existante ;
- `/podcast/[slug]` : une page locale par épisode audio ;
- les onze repères du récit de Jésus : onze futures pages éditoriales détaillées ;
- les états de paiement et de commande déjà gérés par Stripe et le compte.

## 9. Consigne de lecture pour Claude et Claude Code

1. Comparer les 35 écrans au routeur et au code réel avant toute migration.
2. Conserver les traitements Supabase, Stripe, Resend, MailerLite et CMS existants.
3. Mapper les URL du prototype vers les routes déjà en production ; ne pas imposer de nouveaux noms de route si le projet en possède déjà.
4. Appliquer la nouvelle identité visuelle à chaque état : chargement, succès, vide et erreur.
5. Ne jamais déduire du prototype qu’une fonction absente du HTML doit être supprimée.
6. Pour chaque route, appliquer `03-SPECIFICATION-TYPOGRAPHIQUE-STRICTE.md`, puis contrôler les valeurs calculées avec `04-REGISTRE-CSS-TYPOGRAPHIQUE-EXHAUSTIF.md`.

## 10. Conclusion de l’audit

Le comptage est désormais explicite : **35 écrans prototypés**, auxquels s’ajoutent les e-mails transactionnels et un nombre variable de routes dynamiques. Le premier nombre de 21 était incomplet et ne doit plus être utilisé pour décrire l’ensemble du travail.
