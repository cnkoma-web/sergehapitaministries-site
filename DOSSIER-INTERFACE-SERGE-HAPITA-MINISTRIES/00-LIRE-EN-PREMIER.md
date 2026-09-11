# Transmission de la nouvelle interface — Serge Hapita Ministries

**Destinataire : Claude, pour pilotage de l’intégration avec Claude Code**  
**Version du dossier : 35**  
**État arrêté au : 10 septembre 2026**  
**Aperçu publié antérieur :** <https://serge-hapita-accueil-concept.cnkoma.chatgpt.site> — version 32 ; les ajouts Boutique, parcours Compte, contenus juridiques et verrouillage typographique sont inclus dans ce dossier 35.

## 1. Objet du dossier

Ce dossier rassemble le travail de conception réalisé à ce jour pour la nouvelle interface de Serge Hapita Ministries. Le prototype améliore la présentation, la hiérarchie visuelle, la navigation et l’expérience responsive du site. Il ne constitue pas une nouvelle application et ne remplace pas l’architecture technique existante.

**Attention au comptage :** le premier dossier contenait 21 écrans HTML. Après intégration de la Boutique, de la fiche produit, de la confirmation, des quatre pages légales et des sept états du compte, le dossier corrigé contient **35 écrans HTML**. Ce nombre ne représente pas le nombre total d’URL dynamiques du site. Le détail se trouve dans `02-INVENTAIRE-COMPLET-DES-PAGES-ET-PARCOURS.md`.

Claude doit utiliser ce dossier pour piloter l’intégration progressive des choix validés dans le véritable projet Next.js, en préservant le CMS, l’administration et tous les services déjà opérationnels.

## 2. Ordre de lecture

1. Lire ce fichier entièrement.
2. Lire `01-CAHIER-DE-FONCTIONNEMENT-DE-L-INTERFACE.md`. Il contient les décisions visuelles et éditoriales validées au fil du travail.
3. Lire `02-INVENTAIRE-COMPLET-DES-PAGES-ET-PARCOURS.md`. Il distingue les écrans, les e-mails et les routes dynamiques.
4. Lire `03-SPECIFICATION-TYPOGRAPHIQUE-STRICTE.md`. Il explique les polices, tailles, rythmes et raccordements de chaque page.
5. Utiliser `04-REGISTRE-CSS-TYPOGRAPHIQUE-EXHAUSTIF.md` pour contrôler chaque sélecteur typographique et chaque variante responsive.
6. Relire `reference/CAHIER-DES-CHARGES-TECHNIQUE-V4.md`. Il reste la référence pour le fonctionnement technique, le CMS et les règles métier.
7. Examiner `prototype-html/` route par route pour reproduire la présentation dans les composants réels.

## 3. Hiérarchie des références

| Sujet | Référence qui fait autorité |
|---|---|
| Architecture, base de données, CMS, administration, sécurité, authentification et services | Cahier des charges technique v4 et code actuel du véritable site |
| Disposition, design, responsive et composants visuels | Prototype HTML et cahier de fonctionnement de l’interface |
| Polices, tailles, graisses, interlignes, interlettrages et variations responsives | CSS du prototype, spécification typographique stricte et registre CSS exhaustif |
| Textes fournis ou corrigés par Serge | Contenu présent dans le prototype et décisions consignées dans le cahier de fonctionnement |
| Conflit entre une ancienne règle visuelle et une validation plus récente | Cahier de fonctionnement de l’interface, qui restitue les dernières validations |

Le prototype ne doit donc jamais être copié comme une application autonome à la place du projet existant. Il doit être lu comme la couche d’interface à transposer dans l’architecture déjà construite.

## 4. Ce qui a été touché

- La page d’accueil et son héros responsive.
- La navigation générale, ses menus déroulants et les accès Recherche, Compte et Panier.
- Les pages De Serge, La mission et Connaître Jésus.
- Le hub Publications, les hubs Que dit la Bible ? et La Vie Supérieure, ainsi que deux gabarits d’articles.
- Les expériences quotidiennes Rosée Matinale et Je Confesse.
- Le catalogue Livres, une fiche livre, le panier, la connexion, l’inscription et l’aperçu de l’espace personnel.
- Les pages Invitation, Partenariat, Vidéos, Podcast et Contact.
- Les composants de partage, pagination, navigation séquentielle, filtres, cartes et formulaires.
- Le responsive mobile, tablette et ordinateur des pages du prototype.

## 5. Ce qui a été ajouté

- Une page Mission structurée à partir du texte validé.
- Une page Podcast organisée autour de quatre univers : Je Confesse, Que dit la Bible ?, Rosée Matinale et La Vie Supérieure.
- Une page Contact conforme aux quatre champs prévus dans le cahier des charges.
- La Boutique des produits dérivés, un gabarit de fiche produit et la page adaptative de confirmation.
- Les quatre pages légales reliées au pied de page.
- Le parcours visuel de création et de récupération du compte : vérification de l’adresse, mot de passe oublié, e-mail envoyé, validation du lien, nouveau mot de passe et confirmations.
- Trois gabarits d’e-mails : vérification du compte, réinitialisation du mot de passe et accusé de réception du formulaire Contact.
- Une présentation complète du parcours d’achat : catalogue, fiche livre, panier et accès au compte.
- Une restitution précise des onze repères de Connaître Jésus, destinés à devenir de futures pages détaillées.
- Une règle de pagination du Podcast fixée à huit audios par page.
- Une architecture proposée pour les audios hébergés à l’extérieur du serveur du site.

## 6. Ce qui n’a pas été modifié ni reconstruit

- La base de données et ses tables.
- Le CMS et les écrans réels d’administration.
- Supabase Auth, les sessions et les règles d’accès.
- Stripe, les paiements, les stocks, les commandes et les webhooks.
- MailerLite, Resend et les traitements d’e-mails.
- Le moteur de recherche réel.
- La génération dynamique réelle des images Open Graph.
- Le compteur de vues, les mentions J’aime, les avis et leur modération.
- Le stockage ou la diffusion de vrais fichiers audio et vidéo.
- Les traitements serveur des formulaires Contact, Invitation et Partenariat.

Les comportements JavaScript du prototype servent uniquement à montrer l’expérience attendue. Ils ne doivent pas remplacer les traitements sécurisés déjà présents dans le projet.

## 7. Méthode d’intégration attendue

Claude doit piloter Claude Code page par page, en conservant à chaque étape la structure fonctionnelle actuelle :

1. reprendre les styles globaux, l’en-tête, les menus, la recherche et le pied de page ;
2. intégrer les pages éditoriales sans réécrire les textes ;
3. appliquer les nouveaux gabarits aux données dynamiques des publications ;
4. raccorder les parcours Livres, Panier et Compte à leurs fonctions existantes ;
5. raccorder Contact, Invitation et Partenariat aux traitements actuels ;
6. construire le Podcast à partir des données de l’hébergeur externe et du CMS ;
7. vérifier chaque page sur mobile, tablette et ordinateur avant de passer à la suivante.

À chaque intégration, le contenu dynamique doit rester administrable. Un titre, un chapeau, une image, une date, une catégorie, une sélection d’articles similaires ou un élément de partage ne doit pas être figé dans le composant s’il provient aujourd’hui du CMS.

## 8. Podcast : fonctionnement technique à retenir

- Les fichiers audio et leurs vignettes sont hébergés sur une plateforme de podcasts externe. Le site Serge Hapita Ministries ne stocke pas les fichiers audio.
- La proposition actuelle est Ausha, avec un flux RSS et un lecteur intégrable.
- Le CMS synchronise les métadonnées du flux côté serveur ou par tâche planifiée. Le navigateur ne doit pas interroger directement le RSS.
- Chaque audio conserve une page locale unique de type `/podcast/[slug]` afin que l’écoute, le partage et la navigation restent dans l’univers du site.
- Les quatre catégories sont pilotées sur le site. Elles ne doivent pas devenir quatre catégories inventées ou remplacées par `Enseignement` et `Prédication`.
- Chaque page audio fournit ses propres métadonnées Open Graph afin que WhatsApp affiche la bonne carte de partage.

## 9. Contenu du dossier

- `00-LIRE-EN-PREMIER.md` : règles de transmission et méthode d’intégration.
- `01-CAHIER-DE-FONCTIONNEMENT-DE-L-INTERFACE.md` : restitution détaillée de toutes les décisions validées.
- `02-INVENTAIRE-COMPLET-DES-PAGES-ET-PARCOURS.md` : audit exact des 35 écrans présents, des e-mails et des routes dynamiques.
- `03-SPECIFICATION-TYPOGRAPHIQUE-STRICTE.md` : contrat de reproduction typographique, composants communs et contrôle des 35 écrans.
- `04-REGISTRE-CSS-TYPOGRAPHIQUE-EXHAUSTIF.md` : relevé généré des 544 règles typographiques présentes dans les quatre CSS, avec leur contexte responsive.
- `reference/CAHIER-DES-CHARGES-TECHNIQUE-V4.md` : document technique antérieur, conservé comme référence fonctionnelle.
- `reference/pages-source-ancienne-version/` : fichiers Boutique et premières pages légales transmis par Serge, conservés sans modification pour comparaison.
- `reference/contenus-juridiques-integres/` : les quatre sources reçues le 10 septembre 2026 et utilisées pour remplacer les textes provisoires des pages légales.
- `prototype-html/` : les 35 écrans HTML/CSS/JavaScript actuellement prototypés et leurs visuels ; ce dossier n’est pas, à lui seul, l’inventaire de toutes les URL dynamiques du site.
- `gabarits-emails/` : références visuelles pour la vérification du compte, la réinitialisation du mot de passe et l’accusé de réception du formulaire Contact.

## 10. Point de vigilance final

Le rôle du prototype est d’améliorer la maison sans déplacer ses fondations. Lorsqu’un écran statique montre un contenu d’exemple, Claude Code doit retrouver le champ correspondant dans le CMS et raccorder le composant. Lorsqu’un comportement réel existe déjà, il doit être conservé puis habillé avec la nouvelle interface.
