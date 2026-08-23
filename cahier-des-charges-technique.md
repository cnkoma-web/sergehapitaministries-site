# Cahier des charges technique
## Site sergehapitaministries.org — De la maquette statique au site fonctionnel

**À destination de Claude Code.** Ce document décrit précisément ce qui a été validé avec Serge Hapita sur les maquettes HTML/CSS statiques, et ce qu'il reste à construire pour rendre le site pleinement fonctionnel. Il fait autorité sur toute décision de conception : ne pas réinterpréter, ne pas improviser une alternative "probablement équivalente" sans validation de Serge.

### Exigence transversale non négociable : couverture totale du CMS

**Aucun texte, image ou lien visible sur le site ne doit rester codé en dur dans le HTML.** Ceci s'applique à absolument tout élément visible, important ou non :
- Les libellés de navigation (menu principal, sous-menus, footer)
- **Le texte du bandeau ticker défilant** (`topbar-track`) — chaque phrase qui y défile doit pouvoir être ajoutée, modifiée ou supprimée indépendamment depuis l'administration, sans limite de nombre fixée dans le code
- Le logo et toute image utilisée en dur dans le header/footer
- Les titres et sous-titres de hero sur chaque page
- Les textes de tous les boutons (CTA)
- Les liens de réseaux sociaux
- Les textes légaux (mentions légales, politique de confidentialité, etc.)
- Le contenu éditorial (livres, publications, boutique — déjà couvert en détail plus bas)
- Tout texte d'interface (labels de formulaire, messages de confirmation, etc.)

Serge doit pouvoir modifier n'importe lequel de ces éléments depuis une interface d'administration, sans jamais toucher au code. **Le choix de l'outil/architecture pour y parvenir (panneau d'administration sur-mesure, CMS headless comme Strapi/Sanity, ou autre) revient à Claude Code**, qui est le mieux placé pour évaluer les compromis techniques (coût, complexité, hébergement, maintenance). En revanche, **toute option impliquant un coût récurrent (abonnement à un service tiers) doit être présentée à Serge avec son prix avant d'être mise en œuvre** — jamais choisie unilatéralement.

---

## PARTIE 1 — Fondations globales (s'appliquent à toutes les pages sans exception)

### 1.1 Charte graphique

**Couleurs (variables CSS)**
```
--ink:        #1B1730   (texte principal, fonds sombres)
--ink-soft:   #4A4560   (texte secondaire)
--blue:       #2E2FE0
--purple:     #7B3FE4
--teal:       #3D6E86
--magenta:    #9A1FA8
--lavender:       #F3F1FB  (fonds clairs teintés)
--lavender-deep:  #EAE6F9
--line:       #E2DCF3   (bordures, séparateurs)
--paper:      #FCFBFF   (fond footer sur pages avec newsletter)
--gradient:   dégradé blue→purple, utilisé sur les CTA principaux
```

**Typographies**
- Titres : `Fraunces` (serif), souvent en italique pour les citations/accroches
- Corps de texte / UI : `Manrope` / `Inter` (sans-serif)

**Composants réutilisables**
- Boutons pilule (`border-radius:999px`) — `.btn-primary` (dégradé), `.btn-outline` (contour encre)
- Boutons compacts (`.btn-compact`) — utilisés dans les fiches produit (prix + actions sur une ligne)
- Cartouche de partage social : icônes SVG réelles (WhatsApp vert, Facebook bleu officiel, enveloppe email, maillons de chaîne pour copier le lien) dans un cartouche arrondi avec le mot "Partager". **Jamais d'emoji, jamais de lettres bricolées (W, f, @) en guise d'icône.**
- Badges de catégorie : pastille ronde colorée avec initiales (ex. "QB", "VS", "RM") plutôt qu'un tiret ou un emoji devant un titre de section

### 1.2 Structure commune de toutes les pages

**Header (identique sur les 23 pages)**
1. `brand-split` : deux blocs pleine largeur cliquables — ActesDesFilsDeDieu (gauche) / amDG Éditions (droite). Jamais "Serge Hapita" ici (déjà représenté par le logo juste en dessous).
2. `topbar` : bandeau ticker défilant (annonces, dernier livre, newsletter). **Fond dégradé violet/magenta**, volontairement différent du bloc `brand-split` juste au-dessus (qui est noir/dégradé bleu-violet), pour marquer une séparation visuelle claire entre les deux zones.
3. `header-main` : logo horizontal centré (image, pas texte), icônes recherche/compte/panier de part et d'autre. L'icône compte (👤) est un lien vers `compte.html` sur les 23 pages. Le panier affiche un badge numérique (`#cart-count`).
4. `nav-row` : navigation principale, séparée du logo. Le menu déroulant "À propos" contient De Serge / Livres / Vidéos / Invitation / Partenariat. Le menu déroulant "Publications" contient **Que Dit la Bible ? / La Vie Supérieure / Rosée Matinale** (voir 3.2 — Rosée Matinale n'est pas dans le hub Publications mais reste listée ici).

**Footer (identique sur les 23 pages)**
- Colonne 1 : logo + description ("Serge Hapita Ministries — Levallois-Perret, France — ...")
- 3 colonnes nav : **Le site** (De Serge, Livres, Publications, Boutique) / **Ministère** (Invitation, Partenariat, Connaître Jésus, Contact) / **Réseaux** (YouTube, Instagram, TikTok, Facebook)
- Ligne copyright + liens légaux (Mentions légales · Politique de confidentialité · Politique de cookies · Termes et conditions)
- **Sur mobile, les 3 colonnes restent côte à côte sur une seule ligne** (via `.footer-nav-cols{display:contents}` en desktop, `display:grid;grid-template-columns:repeat(3,1fr)` en mobile) — ne jamais les empiler verticalement en liste continue.
- **Fond du footer :** clair (`--paper`) sur les 15 pages qui ont un bloc newsletter juste au-dessus (la bande sombre de la newsletter suffit comme repère visuel). **Fond sombre (`--ink`)**, avec les couleurs de texte adaptées (logo blanc, liens en blanc à 85% d'opacité, etc.), sur les 8 pages sans newsletter listées ci-dessous.

**Bloc newsletter ("ParoleDeViePourVous")**
- **Un seul champ : l'email.** Plus un checkbox RGPD. Jamais de champ Nom ou Ville en plus — ça casse l'affichage sur tablette et c'est rébarbatif pour l'utilisateur.
- Présent sur 15 des 23 pages. **Absent sur 9 pages** (vérifié fichier par fichier) : `partenariat.html`, `mentions-legales.html`, `politique-de-confidentialite.html`, `politique-de-cookies.html`, `termes-et-conditions.html`, `confirmation.html`, `compte.html`, `mon-compte.html`, `panier.html`. Ce sont les pages légales/utilitaires où un CTA marketing n'a pas sa place.

**Hero de page (pages utilitaires : Boutique, Vidéos, Contact, Invitation, Partenariat, Livres, pages légales, Connaître Jésus)**
- Bandeau dégradé pleine largeur (`linear-gradient(120deg, couleur1, couleur2)`), titre en blanc, centré, sous-titre optionnel en dessous.
- Taille du titre : `34px` desktop / `26px` mobile — cohérent sur toutes les pages.
- **Ne jamais mettre le chapeau (texte d'intro/accroche) dans le hero.** Le hero ne contient QUE le titre de la page (+ éventuellement un sous-titre très court). Le chapeau va dans le corps de la page, juste avant le premier bloc de contenu (ex. Invitation : le hero dit "Invitation", le chapeau "Vous souhaitez inviter Serge ?" est dans le corps, juste avant "Vos coordonnées").
- La page Accueil et De Serge ont un hero photo spécifique (voir leurs fichiers), pas ce hero dégradé générique.

### 1.3 Règles de structure CSS à respecter

**Padding sur les éléments combinés à `.wrap`**
La classe `.wrap` porte le padding horizontal (marge gauche/droite) du site. Toute classe additionnelle appliquée sur le même élément (`<div class="wrap ma-classe">`) doit gérer son propre padding vertical avec `padding-top` / `padding-bottom` séparés — jamais avec la notation raccourcie `padding: Npx 0`, qui réinitialiserait `padding-left`/`padding-right` à 0 et supprimerait la marge horizontale :
```css
/* CORRECT — ne touche que le vertical, préserve le padding horizontal de .wrap */
.ma-classe{padding-top: 56px; padding-bottom: 56px;}
```
Avant de livrer une page : vérifier chaque combinaison `class="wrap XXX"` du fichier et confirmer que `XXX` respecte cette règle.

**Texte avec lien inline dans un conteneur flex**
Un `<label>` ou conteneur en `display:flex` contenant une checkbox suivie de texte (avec un lien `<a>` au milieu) doit regrouper tout le texte, y compris les liens inline, dans un unique `<span>` — pour que l'ensemble se comporte comme un seul bloc flex et s'aligne normalement :
```html
<label style="display:flex">
  <input type="checkbox">
  <span>Texte avant <a href="#">lien</a> texte après.</span>
</label>
```

**Classes CSS réutilisées mais non redéfinies**
Quand une page est construite en réutilisant un composant déjà utilisé ailleurs (ex. `.btn-compact`, `.share-cartouche`), vérifier que **la définition CSS du composant a bien été copiée dans le fichier**, pas seulement son usage HTML. Une classe utilisée dans le HTML sans sa règle CSS correspondante ne produit aucune erreur visible : l'élément s'affiche simplement sans le style attendu (bouton sans forme, icône sans mise en page). Ce cas s'est produit sur `mon-compte.html` (`.btn-compact` utilisé mais jamais défini dans le fichier).

**Vérification avant de livrer toute nouvelle page :**
1. Chaque classe combinée à `.wrap` respecte la règle de padding ci-dessus
2. Le hero suit le même gabarit que les pages utilitaires existantes (voir 1.2)
3. Aucun élément déjà présent dans le header ou le footer n'est dupliqué dans le corps de la page
4. Les marges gauche/droite du contenu respirent sur mobile, tablette ET desktop
5. Toute classe CSS utilisée dans le HTML a bien sa règle de style définie dans le fichier
6. Métadonnées SEO complètes (voir 1.4)

### 1.4 Dimensions d'images — couvertures de livres et produits boutique

Aucune dimension précise n'a été fixée dans les maquettes actuelles (les visuels utilisés sont des placeholders en dégradé, dimensionnés uniquement par ratio CSS). **Cette spécification est à trancher par Claude Code au moment de construire l'upload d'image du CMS**, avec ces contraintes de départ :
- **Couvertures de livres** : ratio portrait 2:3 (déjà utilisé en CSS sur `livres.html` et `livre_detail.html`) — proposer une résolution minimale confortable pour un affichage net sur grand écran (ex. 800×1200px) sans imposer un poids de fichier excessif.
- **Photos produits boutique** : ratio carré 1:1 (déjà utilisé en CSS sur `boutique.html` et `produit_detail.html`) — même logique de résolution minimale à définir.
- Le CMS doit **rejeter ou avertir** si un fichier importé ne respecte pas le ratio attendu, plutôt que de laisser une image déformée s'afficher.
- Cette règle de dimension doit être présentée à Serge avant mise en œuvre définitive, au même titre que le choix d'architecture CMS (voir exigence transversale en début de document).

### 1.5 SEO — obligatoire sur chaque page, dès sa création

- `<title>` unique et descriptif
- `<meta name="description">` unique
- `<link rel="canonical">`
- Open Graph complet : `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:site_name`, `og:locale`
- Twitter Card : `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`
- Pages légales : ajouter `<meta name="robots" content="noindex, follow">`
- **Important :** les `og:image` pointent actuellement vers des chemins prévisionnels (`/assets/og/nom-page.jpg`) qui n'existent pas encore physiquement — il faudra créer et héberger ces visuels au moment de la mise en ligne.

### 1.6 Localisation

Le ministère est basé à **Levallois-Perret, France** — jamais "Paris", sur aucune page ni contenu futur.

---

## PARTIE 2 — Inventaire des pages livrées (23 fichiers HTML)

**⚠️ Fichier à ignorer :** `serge-hapita-refonte.html` est une maquette obsolète du tout premier jet du projet (charte graphique différente, abandonnée). Ce n'est PAS une page du site actuel — ne pas l'utiliser comme référence ni la migrer.


### Pages de contenu statique (texte fixe, rarement modifié)

| Fichier | Contenu |
|---|---|
| `accueil.html` | Hero carrousel (3 photos), capsule Rosée Matinale du jour, vidéo Connaître Jésus, teaser À propos, 3 livres en avant + panneau contexte, Publications (2 catégories, cartes headline), agenda, partenariat teaser, réseaux sociaux, newsletter |
| `de-serge.html` | Hero photo, bio complète (texte intégral fourni par Serge), portrait avec citation, chiffres clés, ActesDesFilsDeDieu, dernier livre en rappel, partenariat teaser, réseaux |
| `connaitre-jesus.html` | Contenu réel repris de sergehapita.org/connaitre-jesus : récit complet, versets (1 Co 15:3-4, Rm 4:25, Ac 1:9, Rm 1:4, Rm 10:9-13), formulaire "recevoir Jésus", 11 cartes de faits (badges, pas de photos) |
| `boutique.html` | Uniquement goodies (T-shirts, casquette, mug, tote bag, carnet, écharpe, coque) — **jamais de livres ici**, illustrations SVG dessinées (pas d'emoji, pas de photo) |
| `invitation.html` | Formulaire simplifié depuis sergehapita.org/invitation (voir 3.7) |
| `partenariat.html` | Contenu réel repris de sergehapita.org/partenariat, widget de don interactif (fréquence + montants + montant libre + commentaire), texte à trois registres typographiques distincts (ouverture, sous-titre, pivot) |
| `videos.html` | Grille de 6 emplacements vidéo (2 par catégorie), filtres fonctionnels (Toutes/Prédications/Enseignements/Témoignages), **contenu placeholder honnête** — vraies vidéos YouTube à intégrer |
| `contact.html` | Formulaire seul (Nom, Email, Sujet, Message) — pas de colonne d'infos annexe, le champ Sujet suffit au tri |
| `mentions-legales.html` | Contenu légal standard, sections "à compléter" clairement marquées (SIRET, hébergeur) |
| `politique-de-confidentialite.html` | RGPD standard, mention explicite de Stripe comme sous-traitant |
| `politique-de-cookies.html` | Cookies techniques uniquement pour l'instant, section à compléter si outil de mesure d'audience ajouté |
| `termes-et-conditions.html` | CGU/CGV standard, sections "à compléter avec Claude Code" pour délais de livraison |

### Gabarits à transformer en templates dynamiques (CMS)

| Fichier | Rôle | Champs identifiés |
|---|---|---|
| `livres.html` | Catalogue de livres, façon Rochedy | Grille de cartes : couverture, titre, prix, étoiles+nombre d'avis, boutons Voir/Ajouter |
| `livre_detail.html` | **Gabarit générique** fiche livre (nommé volontairement sans référence à un titre précis) | Couverture, titre, badge, étoiles/avis, prix, boutons compacts, tableau caractéristiques (éditeur, auteur, format, pages, langue, ISBN), description, section avis complète (résumé + formulaire + modération), navigation précédent/suivant, ancre `#avis` pour campagnes de rappel |
| `produit_detail.html` | **Gabarit générique** fiche goodie | Même logique que livre_detail : visuel, sélecteur taille/couleur, prix, caractéristiques (matière, coupe, tailles, entretien, fabrication à la demande), avis, bande "Autres produits" en scroll horizontal (mélange livres+goodies autorisé ici, voir 3.1) |
| `publications.html` | Hub, liste **uniquement** Que Dit la Bible + La Vie Supérieure | Cartes Date/Titre/Chapeau (jamais le verset en tête de carte, voir 3.4) |
| `rosee-matinale.html` | **Page unique et permanente** (URL fixe, ne JAMAIS nommer le fichier avec une date) | Entrée du jour en plein texte (pas un teaser) + archive des jours précédents en dessous sur la même page. Voir 3.2. |
| `que-dit-la-bible-images-esprit.html` | Exemple de gabarit article non verrouillé | Capsule catégorie, titre, date, verset en encadré, corps de texte (paragraphes espacés), section "Aller plus loin" (versets complémentaires), formule de clôture, partage, articles liés |
| `vie-superieure-entrepreneurs-chretiens.html` | Exemple de gabarit article verrouillé | Extrait public (fondu en bas de zone), mur d'accès (bouton Créer un compte/Se connecter), aperçu du sommaire en mots-clés (pas de contenu), partage |

### Pages fonctionnelles (maquettes visuelles uniquement — logique réelle à construire)

| Fichier | Ce qui existe (visuel) | Ce qu'il manque (backend) |
|---|---|---|
| `compte.html` | Connexion + inscription sur onglets basculables (JS). Inscription : Prénom, Nom, Email, Mot de passe, Confirmation du mot de passe. Boutons "Continuer avec Google" / "Continuer avec Facebook" (non fonctionnels, alertes explicites). L'onglet ouvert à l'arrivée dépend du paramètre d'URL `?tab=signup` ou `?tab=login` (ex. le mur d'accès La Vie Supérieure lie vers `compte.html?tab=signup`). Les deux formulaires redirigent vers `mon-compte.html` à la soumission. | Authentification réelle, session, vérification email, mot de passe oublié, intégration OAuth Google/Facebook |
| `mon-compte.html` | Tableau de bord post-connexion, 5 onglets basculables (JS) : Aperçu, Mes commandes, Mon profil (modifier infos), **Mon accès** (bibliothèque des articles La Vie Supérieure débloqués, chacun avec bouton "Lire" + "Télécharger le PDF"), Mes avis. Lien "Se déconnecter" vers `compte.html`. | Contenu réel par utilisateur (commandes, avis), statut d'accès réel (actif/inactif selon abonnement), génération et téléchargement réel des PDF, déconnexion réelle |
| `panier.html` | Articles (mélange livre+goodie), quantité +/−, retirer, code promo, récapitulatif | Persistance réelle du panier, calcul de prix/livraison, intégration Stripe |
| `confirmation.html` | Page unique adaptable via `?type=contact\|invitation\|don\|avis\|newsletter` (JS change le texte affiché) | Rien côté visuel — juste s'assurer que chaque formulaire du site redirige bien vers cette page avec le bon paramètre au lieu d'un `alert()` JS |

---

## PARTIE 3 — Règles métier spécifiques (décisions actées avec Serge)

### 3.1 Séparation Boutique / Livres

Ce sont deux catégories de vente **strictement séparées** dans leur présentation :
- `boutique.html` (hub) ne montre jamais de livres
- `livres.html` (hub) ne montre jamais de goodies
- **Exception unique et volontaire :** le module "Autres produits" en bas d'une fiche produit individuelle (`livre_detail.html` ou `produit_detail.html`) PEUT mélanger les deux catégories. C'est une zone de recommandation croisée (cross-sell), pas une page de classement — la logique est différente et le mélange y est intentionnel.

### 3.2 Rosée Matinale n'est pas une "Publication" au même titre que les autres

- Rosée Matinale a sa propre page dédiée (`rosee-matinale.html`), séparée du hub `publications.html`.
- Cette page est **unique et permanente** : son URL ne change jamais. Le contenu affiché dessus change chaque jour (géré par le CMS). L'ancienne entrée du jour bascule automatiquement dans la liste d'archive en dessous, sur cette même page.
- Le nom du fichier reste générique, sans date (`rosee-matinale.html`), puisque son contenu change chaque jour sans que son URL change.
- Le titre/description/texte de partage de cette page doivent devenir **dynamiques** une fois le CMS branché (générés depuis le contenu du jour), pas codés en dur.
- Le menu "Publications" du site continue d'afficher Rosée Matinale comme option, même si elle vit hors du hub.

### 3.3 Système d'avis (livres et goodies)

- Étoiles + compteur d'avis, affichés à la fois sur les cartes du catalogue et sur la fiche détail.
- **Jamais de faux avis pour combler le vide.** État par défaut honnête : "Aucun avis pour le moment. Soyez le premier à partager votre expérience."
- Le bouton de soumission dit **"Envoyer mon avis"**, jamais "Publier mon avis" — la publication n'est pas instantanée, elle passe par une modération. Message de confirmation : *"Merci ! Votre avis a bien été envoyé et sera visible après validation par l'équipe."*
- Chaque fiche produit a une ancre `#avis` (ex. `livre_detail.html#avis`) permettant à Serge d'envoyer un lien direct vers la section avis dans ses campagnes de rappel, sans que la personne ait à chercher.

### 3.4 Format des cartes "Que Dit la Bible ?"

Sur le hub Publications et dans les listes d'articles liés : **Date → Titre → Chapeau (résumé court)**. Le verset biblique n'apparaît **jamais** en tête de carte — il n'est visible qu'une fois l'article ouvert, dans le corps du texte.

### 3.5 Gating de La Vie Supérieure

- Extrait public visible par tous (plusieurs paragraphes), suivi d'un mur d'accès clair : encadré verrouillé + boutons "Créer un compte" / "Se connecter".
- En dessous du mur, un aperçu du sommaire des sections suivantes, **sous forme de mots-clés / titres de section uniquement** — jamais de contenu réel, juste assez pour donner envie ("la fragrance de la chose", dixit Serge).
- Nécessite un compte utilisateur réel pour débloquer (le bouton "Créer un compte" lie vers `compte.html?tab=signup`, qui ouvre directement l'onglet inscription ; après connexion ou inscription, l'utilisateur est redirigé vers `mon-compte.html`).
- **Modèle économique : accès gratuit dans un premier temps** (le temps de générer du trafic), simplement conditionné à la création d'un compte — pas de paiement à ce stade. **Chaque article doit néanmoins avoir, dès la construction du CMS, une option individuelle "gratuit / payant"** que Serge pourra activer plus tard, article par article — pas un interrupteur global pour toute la section. Prévoir cette granularité dès la conception de la base de données, même si elle reste désactivée au lancement.

### 3.6 Paiement — Stripe uniquement

Serge a déjà un compte Stripe utilisé pour la vente de ses livres. **Toute la logique de paiement du site (livres, goodies, dons) doit passer par Stripe** — un seul prestataire pour l'ensemble, afin de centraliser gestion et tableau de bord. Ne pas introduire un autre service de paiement (HelloAsso ou autre) sans validation explicite de Serge.

### 3.6bis Emails — newsletter et emails transactionnels

Serge utilise déjà, pour le site d'amDG Éditions, deux outils complémentaires qu'il souhaite réutiliser ici plutôt que d'en introduire de nouveaux :
- **MailerLite** — collecte des abonnés et envoi des campagnes de newsletter (le bloc "ParoleDeViePourVous" présent sur la majorité des pages doit alimenter cette plateforme).
- **Resend** — envoi des emails transactionnels déclenchés par le site (confirmation de commande, réponse au formulaire de contact, réinitialisation de mot de passe, notification d'avis validé, etc.).

Ne pas proposer un autre service pour ces deux besoins sans validation explicite de Serge — l'objectif est de réutiliser des comptes déjà existants, pas d'ajouter un coût ou un outil supplémentaire.

### 3.7 Formulaire Invitation

Champs et structure :
- Contact demandeur regroupé (Prénom, Nom, Email, Téléphone)
- Structure (Hôte, Pays, Ville)
- Événement (Type, Ministère désiré, Thème, Dates début/fin)
- Contact sur place : **facultatif** (le demandeur est le contact par défaut, sauf précision contraire)
- Frais de voyage/hébergement (Oui/Non/À discuter)
- Comment nous avez-vous connu : **facultatif**
- Message facultatif + consentement

### 3.8 Bandeau de chiffres clés (accueil)

Sur `accueil.html`, la section `stats` affiche 4 cases (chiffre + libellé), actuellement :
1. **Ouvrages publiés** — dynamique, recalculé sur le nombre réel de livres au catalogue
2. **Publications** — dynamique, recalculé sur le nombre total d'articles publiés (Rosée Matinale + Que Dit la Bible + La Vie Supérieure confondus)
3. **Personnes touchées** — valeur saisie manuellement par Serge (pas de source de donnée automatique)
4. **Nb abonnés RS** — somme des abonnés Facebook/YouTube/Instagram/TikTok, saisie manuelle par Serge (il gère lui-même ce chiffre)

**Ce bloc doit être conçu comme un système à cases activables/désactivables depuis l'administration**, pas un ensemble figé à 4 éléments : Serge doit pouvoir désactiver une case qu'il juge non significative à un moment donné, ou en ajouter une nouvelle, sans intervention sur le code. Prévoir une bibliothèque de statistiques disponibles (au-delà des 4 ci-dessus) parmi lesquelles Serge choisit celles à afficher.

### 3.9 Contenu jamais inventé

Principe transversal appliqué sur tout le site : quand une information réelle manque (prix, ISBN, description produit, avis, vidéo, ancien contenu), afficher un état honnête et visible ("à venir", "à compléter", "aucun avis pour le moment") plutôt que d'inventer une donnée plausible. Ne pas déroger à ce principe pour "faire joli".

---

## PARTIE 4 — Contenu en attente de la part de Serge (ne rien inventer à la place)

- **Que Dit la Bible ?** : texte complet des articles "Marcher Par L'Esprit Est La Réponse", "Être Juste N'est Pas Bien Se Conduire", "Que Faire Quand Mon Prochain Refuse La Paix ?" (titres/versets connus, texte intégral manquant)
- **La Vie Supérieure** : autres articles complets au même format que "Des entrepreneurs qui sont chrétiens..."
- **Livres** : ISBN, descriptions officielles, et couvertures réelles pour les 5 livres qui n'en ont pas encore (seuls Ton Corps T'Écoute et Marcher Dans La Foi ont une vraie couverture intégrée)
- **Boutique** : vrais produits, prix, visuels une fois le catalogue Printful choisi
- **Vidéos** : titres, descriptions et liens YouTube réels pour remplacer les 6 emplacements placeholder
- **Photos** : le site n'utilise actuellement que 3 photos réelles, réutilisées à plusieurs endroits. Des photos supplémentaires seront nécessaires pour varier les visuels — à demander à Serge.
- **Mentions légales** : SIRET / forme juridique si applicable, hébergeur (une fois choisi)

---

## PARTIE 5 — Prochaines étapes techniques (hors du présent document, à anticiper)

1. **Hébergement + nom de domaine** — sergehapitaministries.org. **Serge dispose déjà d'un compte Vercel Pro actif** (équipe "cnkoma-9364's projects", hébergeant déjà 3 autres sites : ActesDesFilsDeDieu, amDG Éditions, La Vie Supérieure d'un autre projet) — le nouveau site doit être ajouté comme projet supplémentaire sur ce même compte, sans souscrire un nouvel abonnement Vercel Pro. Un compte GitHub est également déjà disponible et réutilisable de la même façon.
2. **Choix et mise en place de l'architecture CMS** — couvrant l'intégralité du site (voir exigence transversale en début de document), pas seulement le contenu éditorial. Options et coûts à présenter à Serge avant décision finale.
3. **CMS pour le contenu quotidien** — Rosée Matinale (publication quotidienne, archivage automatique de l'ancien contenu)
4. **CMS pour Publications, Livres, Boutique, navigation, textes d'interface** — ajout/retrait/modification de tout contenu sans toucher au code
5. **Authentification réelle** — création de compte, session, mot de passe oublié, déverrouillage de La Vie Supérieure
6. **Panier persistant + Stripe** — vrai calcul de prix, livraison, code promo, paiement
7. **Modération des avis** — file d'attente, validation, publication
8. **Formulaires connectés** — contact, invitation, don, newsletter, avis → tous doivent rediriger vers `confirmation.html?type=...` au lieu des `alert()` JS actuels
9. **Remplacement des images encodées en base64** par de vrais fichiers image optimisés et hébergés (les maquettes actuelles utilisent du base64 inline, non viable en production pour la performance)
10. **Sitemap.xml et robots.txt**
11. **Visuels Open Graph réels** pour chaque page (`/assets/og/...`), actuellement des chemins prévisionnels

---

*Document rédigé à l'issue de la phase de maquettage statique (HTML/CSS validé page par page avec Serge Hapita). Toute question ou ambiguïté doit être posée à Serge avant toute décision de conception — ce document fait foi sur ce qui a déjà été tranché, mais ne couvre pas nécessairement chaque cas particulier qui pourrait survenir en développement.*
