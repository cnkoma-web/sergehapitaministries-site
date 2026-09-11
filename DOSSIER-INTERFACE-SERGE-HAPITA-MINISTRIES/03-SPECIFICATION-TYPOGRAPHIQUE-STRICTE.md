# Spécification typographique stricte pour Claude et Claude Code

**État : 10 septembre 2026 — version 1**  
**Périmètre : les 35 écrans du prototype, leurs gabarits dynamiques et les trois e-mails de référence.**

## 1. Règle d’exécution

La typographie du prototype est une spécification, pas une source d’inspiration. Claude Code doit reprendre les valeurs présentes dans les CSS sans les simplifier, sans les convertir vers une échelle typographique générique et sans remplacer les polices.

Ordre d’autorité :

1. `prototype-html/styles.css` pour le socle global, l’accueil, À propos de Serge, La mission et Connaître Jésus ;
2. `prototype-html/publications.css` pour Publications, les hubs, les articles, Rosée Matinale, Je Confesse, Podcast et Vidéos ;
3. `prototype-html/commerce.css` pour Livres, Boutique, fiches, panier, compte, espace personnel, confirmations et pages légales ;
4. `prototype-html/engagement.css` pour Invitation, Partenariat et Contact ;
5. `REGISTRE-CSS-TYPOGRAPHIQUE.md` pour le relevé exhaustif de chaque sélecteur comportant une règle typographique ;
6. le présent document pour expliquer l’intention et le raccordement page par page.

Si le projet final utilise Tailwind, CSS Modules ou des composants React, la technologie peut changer. La valeur rendue doit rester identique. Un `font-size: 19px`, un `line-height: 1.82`, une graisse `650` ou un `clamp()` ne doivent pas être arrondis vers une classe voisine.

## 2. Polices verrouillées

| Usage | Police normative | Chargement | Règle |
|---|---|---|---|
| Interface, navigation, métadonnées, formulaires, boutons | `Inter` | Police variable, graisses `400..900`, chargée explicitement au début de `styles.css` | Ne pas remplacer par Manrope, Arial, Roboto ou la police du thème existant. |
| Titres, citations, récit, textes éditoriaux mis en scène | `Georgia` | Pile exacte : `Georgia, "Times New Roman", serif` | Conserver cette pile et ses italiques natifs. |
| Solution de repli de l’interface | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | Utilisée seulement si Inter ne charge pas | Le rendu nominal reste Inter. |

Variables normatives :

```css
--serif: Georgia, "Times New Roman", serif;
--sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Le corps global utilise `Inter`, `16px`, `line-height: 1.6`. Les graisses intermédiaires `650`, `750`, `780`, `850` sont volontaires et rendues par la version variable d’Inter.

## 3. Principes qui ne doivent pas bouger

- Les grands titres emploient Georgia, généralement en graisse `500`, avec un interlettrage négatif. C’est ce qui donne leur présence sans les rendre lourds.
- Le contenu d’interface emploie Inter. Les labels, dates, vues, catégories et boutons utilisent une graisse plus forte et une taille plus petite.
- Le corps des pages narratives emploie Georgia lorsque le texte doit être lu comme un récit ou un enseignement : Mission, Connaître Jésus, articles et description détaillée d’un livre.
- Le corps fonctionnel reste en Inter : formulaires, compte, panier, catalogue, navigation et pages légales.
- Les références bibliques et les métadonnées sont plus petites que la citation ou le titre. Elles ne doivent jamais prendre la même voix typographique que le texte principal.
- Les tailles fluides définies avec `clamp(minimum, valeur fluide, maximum)` doivent être reprises intégralement.
- Les capitales sont réservées aux repères, badges et métadonnées explicitement stylés avec `text-transform: uppercase`. Aucun titre éditorial ne doit recevoir des capitales automatiques.
- Les tailles inférieures à `12px` concernent uniquement des informations décoratives ou très secondaires. Elles ne doivent pas être appliquées au corps, aux commandes essentielles ou aux labels de formulaire.

## 4. Points de rupture normatifs

Les CSS utilisent les seuils suivants. Claude Code doit conserver le seuil associé à chaque règle et ne pas les fusionner dans trois points de rupture génériques.

| Seuil | Usage principal |
|---:|---|
| `1100px` | Ajustements de l’en-tête et de certaines compositions larges de l’accueil. |
| `980px` | Passage des grandes grilles éditoriales et commerciales vers une composition tablette. |
| `820px` | Réorganisation des pages d’engagement. |
| `720px` | Composition mobile principale, tailles de héros, récits, articles et commerce. |
| `620px` | Formulaires Invitation, Contact et Partenariat. |
| `520px` | Ajustements mobiles fins des cartes, livres et publications. |
| `430px` | Contraintes très étroites des publications et du partage. |
| `410px` | Ajustement final de Connaître Jésus. |

## 5. Composants communs : valeurs à reprendre exactement

| Élément | Sélecteur de référence | Police, taille et rythme |
|---|---|---|
| Corps du site | `body` | Inter, `16px`, `1.6`. |
| Barre des réseaux | `.network-bar` | Inter, `13px`, interlettrage `.02em`. |
| Navigation ordinateur | `.desktop-menu` | Inter, `13px`, graisse `650`. |
| Menu déroulant | `.nav-dropdown-menu a` | Hérite de la navigation ; graisse et couleur actives définies par les CSS. |
| Icônes d’action | `.action-icon`, `.action-icon svg` | Cadre `47px`, pictogramme `23px`; ne pas remplacer par un caractère texte. |
| Compteur panier | `.cart-count` | Inter, `10px`, graisse `850`, interligne `1`. |
| Surtitre/repère | `.eyebrow` | Inter, `13px`, graisse `780`, capitales, interlettrage `.18em`. Mobile : `11px` lorsque la règle le prévoit. |
| Grand titre de héros d’accueil | `.hero h1` | Georgia, `clamp(45px, 5.5vw, 76px)`, graisse `500`, interligne `1.03`, interlettrage `-.035em`. |
| Texte du héros d’accueil | `.hero-text` | Inter, `17px`, interligne `1.75`. |
| Bouton principal | `.button` | Inter, `14px`, graisse `750`, hauteur minimale `52px`. |
| Grand titre de section | `.section-heading h2` et sélecteurs associés | Georgia, `clamp(40px, 5vw, 64px)`, graisse `500`, interligne `1.06`, interlettrage `-.035em`. |
| Introduction de section | `.section-heading > p` | Inter, `18px`, interligne `1.65`; mobile `16px`. |
| Lien d’action | `.arrow-link`, `.text-link`, `.catalogue-link` | Inter, taille et graisse exactes définies dans `styles.css`; conserver l’espacement de la flèche. |
| Pied de page, titre | `.footer-about h2` | Georgia, `25px`, graisse `500`. |
| Pied de page, texte | `.footer-about p` | Inter, `15px`, interligne `1.7`. |
| Pied de page, rubriques | `.footer-links strong` | Inter, `12px`, capitales, interlettrage `.12em`. |
| Pied de page, liens | `.footer-links a` | Inter, `14px`. |
| Mentions inférieures | `.footer-bottom` | Inter, `11px`. |

## 6. Accueil

| Élément | Sélecteur | Résultat obligatoire |
|---|---|---|
| Promesse centrale | `.hero h1` | Grand titre Georgia fluide, compact et non gras ; mots accentués en violet clair. |
| Mission résumée | `.hero-text` | Inter `17px/1.75`, largeur limitée ; le lien « Lire davantage » reste dans le flux du paragraphe. |
| Rosée Matinale | `.dew-label`, `.dew-date`, `.dew-content h2`, `.dew-content p` | Badge Georgia `21px`; date Inter `14px`; titre Georgia `26px/1.16`; chapeau Inter `15px/1.5`. |
| Je Confesse | `.confession-label`, `.confession-meta`, `.confession-content blockquote` | Même architecture typographique que Rosée Matinale ; badge Georgia `21px`; métadonnée Inter `12px/850`; proclamation Georgia `23px/600/1.35`. La différence vient de la couleur lavande, pas d’une autre police. |
| Numéros des univers | `.category-number` | Georgia, très grand, en arrière-plan ; le registre CSS contient la taille ordinateur et la réduction mobile. |
| Noms des univers | `.category-card h3` | Georgia `31px/500/1.12`; mobile `29px`. |
| Description des univers | `.category-card .category-copy > p:last-child` | Inter `15px`. |
| CTA des univers | `.category-card > a` | Inter `13px/800`, bouton rectangulaire ; ne pas le transformer en badge. |
| Livres en avant | `.book-info > span`, `.book-info h3`, `.book-info p`, `.book-info a` | Métadonnée `12px/850`; titres Georgia `26px` et `35px` pour le livre principal ; texte `14px`; lien `13px/800`. |

## 7. Pages narratives

### À propos de Serge — `/de-serge/`

- Le héros utilise `.ds-hero h1` : Georgia `clamp(50px, 6.5vw, 88px)`, graisse `500`, interligne `.98`, interlettrage `-.05em`.
- La citation du héros utilise `.ds-hero blockquote` : Georgia `clamp(21px, 2.2vw, 29px)`, italique, interligne `1.35`.
- Les textes narratifs utilisent `.ds-milestone > p`, `.ds-milestone-copy p`, `.ds-today p` : Inter `17px/1.85`, puis `16px` sur mobile.
- Les passages mis en relief utilisent Georgia : `.ds-lead p`, `.ds-portrait-copy`, `.ds-scripture`, `.ds-closing-signature p`.
- Les années `1992`, `2017`, `2022`, `2024` utilisent les styles propres aux jalons et ne doivent pas reprendre le bouton des numéros de section.
- Le bloc final conserve la signature Georgia italique `clamp(29px, 4vw, 49px)/1.4`.

### Mission — `/mission/`

- Le héros utilise `.mission-hero h1` : Georgia `clamp(52px, 7vw, 90px)`, graisse `500`, interligne `1.01`, interlettrage `-.048em`; mobile `40px/1.02`.
- Le corps utilise `.mission-copy p` : Georgia `19px/1.82`; mobile `18px/1.78`. C’est volontairement la même famille éditoriale que le récit de Jésus.
- La citation d’ouverture utilise `.mission-lead` : Georgia `clamp(25px, 2.75vw, 37px)`, italique, interligne `1.48`; référence en Inter `12px/800`, capitales et interlettrage `.13em`.
- Les titres de sections utilisent `.mission-truth-copy h2`, `.mission-sonship-copy h2`, `.mission-kingdom-copy h2`, `.mission-next h2` : Georgia `clamp(43px, 5vw, 70px)` ; mobile `43px`.
- Les numéros de sections utilisent le composant `.section-index span`, différent des dates du parcours.

### Connaître Jésus — `/connaitre-jesus/`

- Le héros utilise `.cj-hero h1` : Georgia `clamp(78px, 12vw, 154px)`, graisse `500`, interligne `.77`, interlettrage `-.065em`; mobile `clamp(72px, 24vw, 105px)`.
- L’introduction utilise `.cj-hero-inner > p:not(.eyebrow)` : Georgia `25px` italique ; mobile `21px`.
- Les grands titres utilisent `.cj-story-heading h2` et sélecteurs associés : Georgia `clamp(44px, 6vw, 72px)` ; mobile `42px`.
- Le texte intégral du récit utilise `.cj-step-copy > p` : Georgia `19px/1.82`; mobile `18px/1.75`.
- Les citations utilisent `.cj-step-copy blockquote` : Georgia `19px` italique, interligne `1.65`; référence `.cj-step-copy cite` en Inter `11px/800`.
- Les onze repères conservent `.cj-step-marker` : numéro Inter `18px/850`, libellé `10px/850`; mobile `14px` pour le numéro.

## 8. Publications et contenus éditoriaux

### Hub général — `/publications/`

- `.pub-hero h1` : Georgia `clamp(54px, 7vw, 92px)`, graisse `500`, interligne `.98`.
- `.pub-hero-copy` : Inter `18px/1.75`.
- `.pub-switcher small` : Inter `11px/800`, capitales ; `.pub-switcher strong` : Georgia `19px/1.15`.
- `.feed-heading h2` : Georgia `clamp(39px, 5vw, 62px)`.
- `.feed-meta` : Inter `12px`; `.feed-entry h3` : Georgia `clamp(27px, 3vw, 38px)` ; `.feed-entry p` : Inter `16px/1.72`.

### Hubs Que dit la Bible et La Vie Supérieure

- `/publications/que-dit-la-bible/` et `/publications/la-vie-superieure/` utilisent la même charpente `.category-hero`, `.category-feed`, `.category-article`.
- `.category-hero h1` : Georgia `clamp(48px, 6.5vw, 82px)`, graisse `500`, interligne `1`.
- `.category-hero p` : Inter `18px/1.72` ; devise Georgia `25px` italique.
- `.category-article h2` : Georgia `34px/1.13`; article mis en avant : `clamp(40px, 5vw, 58px)`.
- Les différences entre les deux hubs viennent du contenu, de la couleur et des classes de catégorie ; la structure typographique reste cohérente.

### Articles Que dit la Bible et La Vie Supérieure

- `/publications/nouvel-article-ozsqc/` et `/publications/nouvel-article-61cdg/` utilisent `.entry-hero`, `.entry-body`, `.scripture-card`, `.share-section` et `.related-section`.
- Titre : `.entry-hero h1`, Georgia `clamp(46px, 6.4vw, 78px)`, graisse `500`, interligne `1.02`.
- Chapeau : `.entry-chapeau`, Inter `18px/1.75`.
- Corps : `.entry-body > p`, Georgia `19px/1.9`.
- Intertitres : `.entry-body h2`, Georgia `35px/600/1.18`.
- Passage biblique : `.scripture-card blockquote`, Georgia `21px` italique, interligne `1.72`; référence Inter `13px`.
- Articles similaires : titre de section Georgia `39px`; titre de carte Georgia `21px/1.25`; chapeau Georgia `17px/1.65`; date Inter `11px/800`.

### Rosée Matinale — `/rosee-matinale/`

- Citation/titre du héros : `.rm-hero h1`, Georgia `36.5px/600/1.12`; la référence utilise Inter à `55%` de cette taille.
- Badge : `.rm-hero .category-badge`, Georgia `24px/600`, sans capitales automatiques.
- Date : `13px`; durée et vues : `12px`.
- Chapeau : `.rm-chapeau blockquote`, Georgia `clamp(25px, 3.3vw, 39px)`, italique, interligne `1.4`.
- Corps, partage, navigation, articles similaires et archives reprennent leurs sélecteurs exacts dans `publications.css`.

### Je Confesse — `/publications/je-confesse-et-declare/`

- Le héros reprend `.rm-hero`, avec la citation de Proverbes à la place du titre éditorial.
- La citation reste Georgia `36.5px/600/1.12`; sa référence est Inter, plus petite et discrète.
- Badge `Je Confesse`, date, durée et vues forment un bloc distinct sous la ligne de démarcation.
- Le texte de confession utilise le corps éditorial `.entry-body` en Georgia `19px/1.9`.
- La signature finale utilise le bloc lavande `.confess-chapeau`; sa référence utilise `.confess-chapeau cite`, Inter `12px/800`.
- Le lecteur audio utilise `.confession-audio` : titre Georgia `24px/600`, libellé Inter `11px/800`, durée Inter `13px`.

### Podcast — `/podcast/`

- `.podcast-hero h1` : Georgia `clamp(52px, 6.4vw, 72px)`, graisse `500`, interligne `.95`.
- Introduction : Georgia `18px/1.5`.
- Filtres : Inter `11px/750`.
- Titre de bibliothèque : Georgia `clamp(34px, 4vw, 46px)`.
- Titre d’épisode : Georgia `clamp(24px, 2.1vw, 30px)` ; description Inter `14px/1.52`; métadonnées Inter `12px/750`.

### Vidéos — `/videos/`

- Le héros conserve la famille des pages Publications.
- Titre de bibliothèque : `.video-library-head h2`, Georgia `clamp(38px, 5vw, 54px)`.
- Filtres : Inter `12px/750`.
- Titre de vidéo : `.video-card-copy h3`, Georgia `23px/600/1.2`.
- Type de vidéo : Inter `10px/800`, capitales et interlettrage `.1em`.

## 9. Livres, Boutique et vente

### Catalogue Livres — `/livres/`

- `.store-hero h1` : Georgia `clamp(54px, 8vw, 94px)`, graisse `500`, interligne `.95`.
- Texte d’introduction du héros : Inter `17px/1.7`.
- Les titres, promesses, prix, métadonnées, pagination et conclusions utilisent strictement les sélecteurs `catalogue-*`, `catalog-*` et `store-*` de `commerce.css`.
- Les couvertures sont l’élément principal ; aucune typographie ajoutée ne doit concurrencer leur lecture.

### Fiche livre — `/livres/manifester-ce-que-dieu-a-prevu/`

- `.book-detail-copy h1` : Georgia `clamp(45px, 5.4vw, 67px)`, graisse `500`, interligne `1.01`.
- Noms de l’auteur et de l’éditeur : `.book-byline`, Inter `13px`, sans libellé « écrit par » ou « édité par ».
- Promesse : `.book-promise`, Georgia `20px/1.55`.
- Prix : `.book-price`, Georgia `37px/600`.
- Fiche technique : libellé Inter `10px`, valeur Inter `13px/700`.
- Description : titre Georgia `clamp(40px, 5vw, 61px)` ; corps Georgia `19px/1.78`; premier paragraphe `24px/1.58`.
- Partage : titre Georgia `25px/600`; boutons carrés avec pictogrammes SVG.
- Navigation : Inter `12px/750`, libellés exacts `Précédent`, `Tous les livres`, `Suivant`.

### Panier — `/panier/`

- Titres des panneaux : Georgia `24px/600`.
- Type de produit : Inter `10px/850`, capitales.
- Nom du produit : Georgia `20px/1.2`.
- Quantité : Inter `13px/800`; action de suppression `11px`.
- État vide : titre Georgia `29px`, CTA Inter `13px/800`.

### Boutique — `/boutique/`

- Le héros utilise `.shop-hero` et la famille `.store-hero` ; titre Georgia `clamp(48px, 7vw, 76px)`.
- Introduction : titre Georgia `clamp(34px, 4.8vw, 52px)` ; texte Inter `15px/1.7`.
- Carte produit : visuel Georgia `23px`; titre Georgia `20px/600`; statut Inter `12px`; action Inter `12px/800`.

### Fiche produit — `/boutique/t-shirt-voix-prophetique/`

- Elle reprend le gabarit de fiche commerciale et ses valeurs dans `commerce.css`.
- Visuel provisoire : Georgia `42px/1.03` ; statut secondaire Inter `10px/800`.
- Message d’indisponibilité : Inter `14px/1.6`.
- Labels de variante : Inter `11px/800`; bouton indisponible : Inter `800`.

## 10. Compte, confirmations et espace personnel

### Connexion et inscription — `/compte/`

- Titre de la zone d’introduction : `.account-aside h1`, Georgia `48px/500/1.04` ; réduction mobile définie dans `commerce.css`.
- Points de repère : Inter `13px`.
- Onglets : Inter `800`.
- Titre de formulaire : `.account-pane h2`, Georgia `35px/600`.
- Labels : Inter `12px/800`; champs : héritent d’Inter ; bouton : Inter `800`; aide : `11px`.
- L’ordre visuel reste : titre du formulaire, phrase d’accueil, Google/Facebook, séparateur, e-mail et mot de passe.

### Écrans du parcours de compte

Les routes suivantes utilisent toutes le gabarit `.account-flow-*` généré par `account-flow.js` :

- `/compte/verification-email/` ;
- `/compte/mot-de-passe-oublie/` ;
- `/compte/email-envoye/` ;
- `/auth/confirm/` ;
- `/compte/nouveau-mot-de-passe/` ;
- `/compte/mot-de-passe-modifie/` ;
- `/compte/compte-active/`.

Pour chacune : titre Georgia `clamp(35px, 5vw, 49px)/500/1.04`; introduction Inter `15px/1.7`; label Inter `12px/800`; bouton Inter `13px/800`; lien Inter `12px/800`; titre d’état Georgia `19px`; texte d’état Inter `12px/1.55`.

### Confirmation générique — `/confirmation/?type=…`

Elle utilise exactement le même gabarit `.account-flow-*`. Les variations `contact`, `invitation`, `don`, `avis`, `newsletter` et `commande` changent le contenu, jamais la typographie.

### Espace personnel — `/mon-compte/`

- Titre : `.dashboard-head h1`, Georgia `clamp(45px, 6vw, 68px)/500`.
- Liens et commandes : Inter `12px/800`.
- Onglets : Inter `750`.
- Titre de panneau : Georgia `34px/600`.
- État vide : titre Georgia `23px`; texte Inter `13px`; lien Inter `12px/800`.

## 11. Invitation, Partenariat et Contact

### Invitation — `/invitation/`

- Héros : `.engagement-hero h1`, Georgia `clamp(57px, 8vw, 94px)/500/.96`; mobile `48px/1.02`.
- Introduction : titre Georgia `clamp(36px, 5vw, 54px)` ; texte Inter `16px`.
- Numéros de formulaire : Inter `11px/800`.
- Titres des groupes : Georgia `23px/600/1.15`.
- Labels : Inter `13px/750`; champs Inter `16px/500`; choix radio Inter `14px`.
- Consentement : Inter `12px/1.6`; bouton : Inter `800`.

### Partenariat — `/partenariat/`

- Héros : même famille `.engagement-hero`; titre spécifique `.partnership-hero h1`, Georgia `clamp(50px, 7vw, 82px)`.
- Sous-titre : Georgia `clamp(29px, 4vw, 44px)`, italique, interligne `1.35`.
- Texte d’ouverture : Georgia `21px/1.8`; pivot Inter `17px/800/1.65`.
- Titre de don : Georgia `clamp(39px, 5vw, 59px)` ; texte Inter `16px/1.75`.
- Montants : Georgia `20px/600`; labels et boutons restent en Inter.

### Contact — `/contact/`

- Héros compact : `.contact-hero h1`, Georgia `clamp(46px, 6vw, 68px)` ; mobile `42px`.
- Titre de formulaire : Georgia `clamp(38px, 5vw, 55px)` ; mobile `36px`.
- Introduction : Inter `15px/1.7`.
- Labels, champs, consentement et bouton reprennent exactement les styles partagés d’Invitation.

## 12. Pages légales

Les quatre routes suivantes utilisent exactement le même gabarit :

- `/mentions-legales/` ;
- `/politique-de-confidentialite/` ;
- `/politique-de-cookies/` ;
- `/termes-et-conditions/`.

Valeurs : titre de héros Georgia `clamp(40px, 6vw, 67px)/500/1`; date Inter `12px`; navigation latérale Inter `10px` pour le titre et `12px/1.35` pour les liens ; intertitres Georgia `27px/600/1.2`; corps et listes Inter `16px/1.8`.

## 13. E-mails de référence

Les trois fichiers de `email-templates/` sont des gabarits visuels. Les clients de messagerie ne chargent pas tous les polices web : conserver leur pile de repli et leurs styles en ligne. Claude ne doit pas leur appliquer automatiquement la feuille CSS du site.

## 14. Contrôle obligatoire avant validation

Pour chaque route :

1. vérifier la police réellement chargée dans le navigateur ;
2. comparer la taille calculée, la graisse, l’interligne et l’interlettrage avec le sélecteur correspondant ;
3. contrôler les largeurs ordinateur, tablette et mobile aux seuils exacts du prototype ;
4. confirmer qu’aucune règle du thème existant, du CMS ou d’un composant ne surcharge la typographie ;
5. vérifier le zoom texte à `200 %` sans chevauchement ni coupure ;
6. comparer visuellement au prototype avant de considérer la page intégrée.

Le script `outils/generate-typography-register.mjs` régénère le registre exhaustif depuis les CSS. Une différence entre ce registre et le code final doit être considérée comme une divergence à corriger, sauf validation explicite ultérieure de Serge.
