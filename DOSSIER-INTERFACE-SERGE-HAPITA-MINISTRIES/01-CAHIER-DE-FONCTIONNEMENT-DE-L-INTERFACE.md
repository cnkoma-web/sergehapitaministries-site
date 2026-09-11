# Restitution de la nouvelle interface — Serge Hapita Ministries

Ce document accompagne le prototype HTML/CSS/JS. Il décrit les choix d’interface validés, les règles éditoriales à préserver et les éléments que Claude devra raccorder au fonctionnement existant du site et du CMS. La nouvelle interface améliore la présentation sans modifier l’architecture fonctionnelle décrite dans le cahier des charges technique v4.

## 1. Règles transversales

### Typographie : exécution stricte

- La typographie est verrouillée par `03-SPECIFICATION-TYPOGRAPHIQUE-STRICTE.md` et par le relevé exhaustif `04-REGISTRE-CSS-TYPOGRAPHIQUE-EXHAUSTIF.md`.
- Les quatre feuilles `prototype-html/styles.css`, `prototype-html/publications.css`, `prototype-html/commerce.css` et `prototype-html/engagement.css` constituent la source normative. Claude Code doit en reprendre les valeurs exactes, même si l’intégration finale utilise Tailwind, CSS Modules ou des composants React.
- `Inter` est chargée comme police variable pour l’interface, avec les graisses `400..900`. `Georgia, "Times New Roman", serif` reste la pile éditoriale.
- Les tailles, graisses, interlignes, interlettrages, `clamp()` et règles responsives ne doivent être ni arrondis, ni remplacés par une échelle voisine.
- Le registre inventorie chaque sélecteur typographique, avec son fichier, sa ligne, son contexte responsive et ses déclarations exactes. Toute divergence doit être corrigée sauf validation ultérieure explicite de Serge.

### Identité de la maison d’édition

- Nom complet : **amDG Éditions du Royaume**.
- Nom court : **amDG Éditions**.
- Lien officiel : <https://www.amdgeditions.fr/>.
- Les lettres `a` et `m` restent toujours en minuscules ; `DG` reste en majuscules.
- Le nom est au singulier : `Édition`, jamais `Éditions`.
- Toute règle CSS de transformation en capitales doit être neutralisée sur cette marque. Le prototype utilise la classe `.brand-case` dans les contextes concernés.
- Le cahier des charges v4 emploie encore l’ancienne graphie à certains endroits : ces occurrences devront être mises à jour.

### Navigation

- Menu principal : Accueil, À propos, Connaître Jésus, Publications, Boutique, Soutenir, Contact.
- `À propos` est un menu déroulant : De Serge, La mission, Livres, Vidéos, Podcast, Invitation, Partenariat.
- `Publications` est à la fois un lien vers le hub général et un menu déroulant : Que dit la Bible ?, La Vie Supérieure, Rosée Matinale, Je Confesse.
- Le lien `Livres` de la navigation ouvre toujours `/livres/`. Il ne doit pas descendre vers la section Livres de l’accueil.
- La section `Dernières parutions` de l’accueil reste un aperçu éditorial et un accès vers le catalogue, pas le catalogue lui-même.
- Les actions Recherche, Compte et Panier restent clairement identifiables dans l’en-tête. L’ouverture de la recherche se fait entre l’en-tête et le héros.

### Principes éditoriaux et CMS

- Ne jamais réécrire les textes de Serge. La mise en page peut les rythmer, les découper visuellement ou les mettre en scène, mais leur formulation et leur sens restent intacts.
- Ne pas inventer de chapeau, de catégorie, de référence biblique, de nom d’auteur ou de métadonnée absente du CMS.
- Les composants de présentation doivent accepter les champs existants et les options de visibilité déjà gérées par l’administration.
- Les numéros de section (`01`, `02`, etc.) sont des repères graphiques, distincts des dates et des années.
- Les boutons d’action restent rectangulaires ; les badges éditoriaux restent des capsules arrondies.
- Dans les navigations séquentielles, employer uniquement `Précédent` et `Suivant`. Ne pas répéter le type de contenu (`Livre`, `Proclamation`, etc.). Le lien central reste contextuel : `Voir les archives` pour les publications quotidiennes et `Tous les livres` pour les ouvrages.

## 2. Accueil

- Héros immersif, plus court sur ordinateur et tablette afin que le début de la section suivante soit visible sans défilement. Le mobile conserve une composition adaptée à son format.
- La mission est mise en valeur autour des trois verbes : **Révéler**, **Affermir**, **Manifester**. Ces expressions ne doivent pas être parasitées par d’autres mots sur la même ligne de force.
- L’extrait de mission mène vers `/mission/`.
- Les trois grands univers éditoriaux utilisent un badge coloré pour le nom de la catégorie et un bouton distinct pour l’action.
- Phrase de La Vie Supérieure : « Une connaissance destinée à devenir l’expérience de la vie en Christ. »
- Rosée Matinale et Je Confesse sont deux capsules d’action quotidiennes consécutives. Elles partagent la même structure et la même police, mais sont distinguées par la couleur ; Je Confesse utilise une lavande claire.
- Je Confesse affiche une proclamation, sans référence biblique obligatoire, avec le CTA `Lire et proclamer →`. Une lecture audio pourra être ajoutée plus tard.
- La section Livres est un teaser. L’effet montrant partiellement les couvertures est volontaire sur l’accueil uniquement.
- Les autres blocs validés restent : portrait/mission, invitation, soutien, newsletter et pied de page.

## 3. Page « De Serge »

- Badge d’entrée : `À propos de Serge`.
- Le parcours reprend le texte source fourni, sans réécriture.
- Repères temporels :
  - 1992 : Révélation de Christ.
  - 2017 : Mis à part pour l’œuvre du ministère.
  - 2022 : International School of Ministry du Pastor Chris Oyakhilome.
  - 2024 : Charis Bible College d’Andrew Wommack.
- La partie `Aujourd’hui` précède la partie consacrée aux formations, afin de préserver la continuité du récit.
- La publicité après l’association met en avant le dernier livre et mène vers le catalogue.
- Expression validée : `Une marche par l’Esprit`.
- CTA d’invitation : `Invitez Serge`, accompagné d’une courte phrase expliquant qu’il peut être invité à partager son message. Le CTA doit mener au formulaire d’invitation existant.
- Fermeture à traiter comme une signature/déclaration : « Chaque livre écrit, chaque message prêché, chaque action entreprise devient un appel au réveil, à la restauration, à l’affermissement — et surtout, un cri pour ramener les cœurs à Dieu, le Père. »

## 4. Page « La mission »

- Le héros reprend le même ordre de mission que l’accueil.
- Les quatre sections numérotées forment un cheminement cohérent : Le mandat, La révélation, La conscience/l’identité de fils, Le Royaume rendu visible.
- Titre validé : `La vérité qui rend libre`, et non `Une vérité qui affranchit`.
- Le mandat commence par la citation d’Actes 26:15-18, puis présente le ministère comme né de ce mandat.
- Les images sont utilisées à leur résolution source, sans agrandissement destructeur. Le cadrage du bloc final doit conserver le visage visible sur ordinateur, tablette et mobile.
- Sur mobile, le héros est volontairement réduit afin que le début de la section `01 — Le mandat` apparaisse dès le premier écran. Cette réduction concerne seulement la hauteur et les espacements, pas la composition graphique.
- Le corps de texte a été augmenté pour une lecture plus confortable et emploie la même police éditoriale avec empattements que le récit de la page Connaître Jésus.
- La fin comporte deux voies distinctes : `Découvre qui Il est →` vers Connaître Jésus et `Contacte Serge →` vers le formulaire de contact.

## 5. Page « Connaître Jésus »

- Le texte original intégral reste le cœur de la page. Il est mis en scène comme un cheminement et ne doit pas être remplacé par un résumé réécrit.
- Les citations bibliques restent à leur emplacement logique dans le récit.
- Les onze repères du récit de Jésus sont des portes d’entrée vers de futures pages détaillées. Chaque page pourra contenir un texte, une phrase forte et éventuellement des images.
- Le système de partage existant doit être conservé et raccordé à la nouvelle disposition.

## 6. Publications

### Hub général

- `/publications/` agrège le flux des publications de connaissance, principalement Que dit la Bible ? et La Vie Supérieure.
- Les badges servent ici à identifier la catégorie de chaque article, puisque plusieurs catégories sont mélangées.
- Rosée Matinale et Je Confesse sont affichées à part, avec un traitement quotidien spécifique.
- La pagination et le nombre d’articles par page restent ceux du cahier des charges/CMS.
- L’accès au flux doit être immédiat sur mobile : pas de grand bloc de navigation intermédiaire qui retarde les publications.

### Hubs de catégorie

- Que dit la Bible ? et La Vie Supérieure possèdent chacun un héros compact et un flux d’articles.
- Le premier article peut recevoir une mise en avant visuelle, avec son vrai titre, son vrai chapeau et sa vraie date.
- Dans un hub déjà identifié, il n’est pas nécessaire de répéter le badge de catégorie sur chaque article.
- Une carte de flux affiche la date, le nombre de vues, le titre et le chapeau. Le nom de l’auteur ne s’affiche que dans la page article.

### Rosée Matinale et Je Confesse

- L’URL principale ouvre directement la publication du jour.
- Le héros est dynamique : badge, date, titre et image propre à la publication.
- Après le contenu : navigation jour précédent/suivant et archive, partage, articles similaires sélectionnés dans l’administration, puis publications précédentes.
- La navigation quotidienne affiche seulement `Précédent`, `Voir les archives` et `Suivant`.
- Je Confesse reprend ce fonctionnement. Son nom public est désormais `Je Confesse`.
- Une confession ne possède pas de titre éditorial, contrairement à Rosée Matinale. Dans le héros, le passage biblique prend la place du titre tout en conservant le badge `Je Confesse`, la date, la durée de lecture et le nombre de vues.
- Pour la confession actuellement présentée, le héros affiche Proverbes 18:20. L’image fournie servait uniquement de référence textuelle et ne doit pas être intégrée à la page.
- Dans ce héros, la citation et sa référence `Proverbes 18:20` forment un seul ensemble visuel. La référence suit directement le texte, mais reste volontairement plus petite, plus discrète et composée dans une police différente. Une ligne de démarcation sépare cet ensemble du second bloc visuel réunissant le badge `Je Confesse`, la date, la durée et le nombre de vues.
- La confession commence immédiatement après le héros et reste conservée intégralement, sans chapeau, titre ajouté ni réécriture.
- La déclaration commençant par `Ayez l’audace de dire les mêmes choses que Dieu a dites à votre sujet dans sa Parole`, avec Romains 10:10, devient la signature de clôture de la confession. Son bloc lavande vient après le dernier paragraphe et juste avant la zone blanche contenant `J’aime` et la navigation quotidienne.
- Une confession peut être reliée à une version audio et à une série du hub Podcast. Cette relation est facultative et pilotée par le CMS.
- Ne pas employer le portrait de Serge par défaut pour illustrer Je Confesse ; l’image doit venir du contenu administré.

### Pages article

- Conserver l’en-tête et le pied de page communs du site.
- Le badge de catégorie apparaît dans le héros. Une éventuelle porte d’accès (`Enseignement`, etc.) se place à proximité du badge seulement si cette donnée existe réellement.
- Les mots-clés/catégories associés viennent immédiatement après la fin de l’article.
- Pour Que dit la Bible ?, la formule de clôture `Que Dieu te bénisse` reste présente si elle appartient au contenu source.
- Le bloc `Aller plus loin` reste dynamique et reçoit le verset/passage prévu par le CMS.
- Toutes les actions de partage utilisent de vrais pictogrammes SVG, jamais les noms ou abréviations des réseaux en texte. Elles reprennent la même famille visuelle que `Partager ce livre` : boutons carrés à contour, avec une couleur adaptée à la page ou à la catégorie.
- Phrase de partage exacte : `Bénis quelqu’un en partageant ce message.`
- Sur mobile, les huit actions de partage restent sur une seule ligne ; leur taille est réduite sans perdre leur zone d’action ni leur lisibilité.
- Les articles similaires doivent conserver date, titre et chapeau selon les données disponibles.
- Toute structuration interne particulière (numéros, intertitres) doit provenir du contenu riche géré par le CMS, pas d’une structure codée en dur.

## 7. Librairie et parcours d’achat

### Hub `/livres/`

- Le catalogue affiche les vraies couvertures avant. La quatrième de couverture apparaît au survol sur les appareils qui le permettent.
- Le conteneur `.cover-switch` doit rester un bloc dimensionné par un ratio `2 / 3`. L’absence de cette règle provoquait les couvertures invisibles ; ce défaut est corrigé.
- Chaque carte affiche : couverture, éventuel statut utile (`Nouveauté`, `Précommande`), titre, prix, accès à la fiche et ajout au panier.
- Les mentions répétitives `Écrit par`, `Par`, `Édité par` ou le nom de l’éditeur ne figurent pas dans les cartes du catalogue.
- Le mobile commence rapidement par le catalogue : héros et phrase manifeste raccourcis en hauteur.
- Les indicateurs `7 livres au catalogue` et `100 % édition indépendante` sont placés après la pagination, comme conclusion.
- Ne pas afficher de libellé technique ou descriptif au-dessus de la grille tel que `Le catalogue — couvertures avant et arrière`, ni d’indication redondante `Page 1 sur 2`. Les couvertures et la pagination numérique suffisent à l’utilisateur.
- La pagination de démonstration affiche quatre livres sur la première page et trois sur la seconde ; le développement final doit reprendre le paramétrage du CMS.

### Fiche livre

- Composition validée : couverture avant/arrière, titre, ligne sobre `Serge Hapita · amDG Éditions`, promesse, prix, quantité, ajout au panier, métadonnées, description complète, partage, avis et navigation entre livres.
- Ne pas écrire `Écrit par`, `Par` ou `Publié par` sous le titre.
- Le nom de l’éditeur peut rester explicite dans la fiche technique et doit pointer vers <https://www.amdgeditions.fr/>.
- La description existante est validée et doit être conservée.

### Panier et paiement

- Le panier de la maquette utilise `localStorage` uniquement pour démontrer le parcours et les états d’interface.
- Le développement final doit conserver/raccorder la logique existante : panier persistant, quantités, suppression, total, code promotionnel éventuel, authentification et paiement Stripe selon le cahier des charges.
- La maquette ne remplace aucune règle métier, aucune validation serveur et aucun contrôle de stock.

### Boutique, fiche produit et confirmation

- Route du hub : `/boutique/`. Cette rubrique contient uniquement les produits dérivés ; les livres restent dans `/livres/`.
- Les huit références transmises sont conservées : T-shirt Voix Prophétique, T-shirt Logo Ministries, casquette brodée, mug Rosée Matinale, tote bag, carnet de notes, écharpe et coque téléphone.
- Comme ces produits ne sont pas encore ouverts à la vente, la maquette indique honnêtement `Bientôt disponible` et n’invente ni prix, ni photo, ni variante.
- `/boutique/t-shirt-voix-prophetique/` représente le gabarit générique d’une fiche produit. En production, le visuel, le prix, la matière, les couleurs, les tailles, l’entretien, la disponibilité, les avis et les produits associés doivent venir du CMS.
- La route de démonstration ne doit pas imposer un nouveau modèle d’URL. Claude doit la mapper au gabarit dynamique et aux routes déjà présents dans le projet réel.
- `/confirmation/?type=contact|invitation|don|avis|newsletter|commande` est un gabarit adaptatif après action. La page de confirmation sur le site et l’e-mail transactionnel sont deux réponses distinctes.

## 8. Connexion, inscription et espace personnel

### Connexion et inscription

- Sur mobile, le panneau d’introduction `Espace personnel` est volontairement compact afin que `Heureux de vous revoir`, l’adresse e-mail et l’action de connexion soient visibles rapidement.
- L’ordre de lecture de la connexion est impératif : onglet `Se connecter`, titre `Heureux de vous revoir`, phrase `Connectez-vous à votre espace personnel`, choix Google/Facebook, séparateur `ou avec votre adresse e-mail`, puis champs Adresse e-mail et Mot de passe.
- Connexion : Adresse e-mail, Mot de passe.
- Inscription : Prénom, Nom, Adresse e-mail, Mot de passe, Confirmation du mot de passe.
- Les alternatives Google et Facebook apparaissent également avant les champs du formulaire d’inscription.
- Dans la maquette, ces boutons indiquent explicitement que le raccordement reste à réaliser. En production, Claude doit les connecter à Supabase Auth, conformément au cahier des charges.
- L’onglet actif reste pilotable par l’URL (`?tab=login` ou `?tab=signup`).
- Le prototype comprend désormais les écrans de vérification de l’adresse e-mail, de mot de passe oublié, d’e-mail de récupération envoyé, de création d’un nouveau mot de passe, de succès et d’erreur. Leur inventaire et leur ordre exact sont décrits dans `02-INVENTAIRE-COMPLET-DES-PAGES-ET-PARCOURS.md`.
- Le lien `Mot de passe oublié ?` ouvre le parcours complet. Le lien de récupération reçu par e-mail doit d’abord passer par `/auth/confirm`, qui échange le jeton une seule fois contre une session valide, avant d’afficher le formulaire de nouveau mot de passe.
- Après une inscription par e-mail, l’interface doit confirmer l’envoi du message de vérification, expliquer l’action attendue et proposer de renvoyer le message. Les états `adresse déjà utilisée`, `lien expiré`, `lien invalide`, `e-mail renvoyé` et `compte activé` doivent être prévus.
- Les e-mails ne sont pas des pages HTML publiques du site. Ils nécessitent néanmoins des gabarits visuels cohérents : vérification de compte, récupération de mot de passe et accusés transactionnels prévus par le cahier des charges.

### Espace personnel

- Conserver les cinq espaces prévus par le cahier des charges et leurs données réelles : vue d’ensemble, commandes, profil/informations, avis et accès/déconnexion selon la nomenclature finale du CMS.
- Les formulaires et états du prototype sont visuels ; les écritures et lectures doivent rester reliées à Supabase et aux règles d’autorisation existantes.

## 9. Invitation

- Route : `/invitation/`.
- Le héros utilitaire reste compact et porte uniquement le titre `Invitation` ; l’introduction `Vous souhaitez inviter Serge ?` ouvre le contenu du formulaire.
- Le formulaire conserve les quatre groupes fonctionnels de la source et du cahier des charges : coordonnées, structure, événement et informations complémentaires.
- Champs attendus : prénom, nom, e-mail, téléphone, hôte, pays, ville, type d’invitation, ministère désiré, thème, dates de début et de fin, contact sur place, prise en charge du voyage/hébergement, origine de la découverte du ministère et message.
- Les numéros `01` à `04` servent uniquement de repères de sections. Les libellés, options, champs obligatoires et consentement doivent être conservés lors du raccordement au traitement existant.
- Les titres de section sont intégrés au contenu de chaque bloc avec de véritables marges internes. Ne pas utiliser le positionnement particulier de `fieldset/legend`, qui collait les titres au cadre selon le navigateur et la largeur d’écran.
- Les choix radio des informations complémentaires restent compacts : cercles de sélection de taille standard et libellés alignés, sans grandes cartes ni encadrements décoratifs.
- La maquette valide seulement la cohérence des dates et affiche un état explicite ; l’envoi réel doit être reconnecté au traitement serveur actuel.
- La newsletter reste présente en bas de cette page.

## 10. Podcast

- Route du prototype : `/podcast/`.
- Cette page constitue la bibliothèque audio de quatre univers éditoriaux uniquement : `Je Confesse`, `Que dit la Bible ?`, `Rosée Matinale` et `La Vie Supérieure`.
- Ne pas créer de catégories autonomes `Enseignements` ou `Prédications`. Les enseignements approfondis et les formats longs appartiennent à `La Vie Supérieure`, selon l’article dont ils proviennent.
- Les filtres de la maquette reprennent strictement ces quatre univers et permettent un accès immédiat à leurs audios.
- `Je Confesse` peut recevoir les versions audio des proclamations. Une confession reste sans titre éditorial sur sa page écrite, mais son audio reçoit un intitulé de classement thématique, par exemple `Santé divine`, afin d’être retrouvable autrement que par sa date.
- Que dit la Bible ?, Rosée Matinale et La Vie Supérieure reprennent naturellement le titre de leur article comme titre de l’audio.
- Champs à raccorder au CMS pour un audio : univers, intitulé audio, thème éventuel, date, URL de l’épisode hébergé, durée, vignette, visuel de partage et lien vers le contenu écrit associé.
- La pagination de la bibliothèque est fixée à **8 audios par page**, quel que soit l’appareil. La grille affiche deux colonnes fines sur ordinateur et une colonne sur tablette/mobile ; conserver le même nombre par page évite qu’un changement d’écran modifie les repères de navigation.
- Le site doit rester le point central de découverte, d’écoute et de partage, mais **ne doit pas héberger les fichiers audio**. Les fichiers, vignettes et métadonnées sont publiés chez un hébergeur de podcasts externe ; le CMS importe ou synchronise les données du flux RSS et affiche sur chaque page Serge Hapita Ministries le lecteur intégré du fournisseur.
- Recommandation technique retenue pour démarrer : **Ausha**, avec l’offre `Launch` suffisante pour l’audio. Elle comprend l’hébergement, les épisodes et écoutes illimités, la diffusion vers les principales plateformes, un flux RSS et le Smartplayer intégrable. L’offre `Supersonic` n’est nécessaire que si une API ou des webhooks deviennent indispensables ; la première version peut synchroniser périodiquement le flux RSS dans le CMS.
- Ne pas appeler directement le flux RSS depuis le navigateur. Claude doit prévoir un import côté serveur/CMS ou une tâche planifiée, mettre en cache les métadonnées et conserver une page locale unique par audio (`/podcast/[slug]`). L’écoute reste dans le site tandis que le fichier est diffusé depuis Ausha.
- Le partage des audios possède sa propre interface : boutons rectangulaires et explicites `WhatsApp` et `Partager`, conçus pour une action immédiate sur mobile. Il ne reprend pas la rangée de petits pictogrammes utilisée au bas des articles.
- Chaque page audio devra produire une carte de partage propre à l’épisode, avec l’univers, l’intitulé, l’identité Serge Hapita Ministries et le lien direct. Sur WhatsApp et les réseaux, cette carte doit être fournie par les métadonnées Open Graph de la page audio ; le bouton partage le lien, et la plateforme affiche automatiquement le visuel correspondant.
- Le prototype montre la structure d’interface avec le contenu fourni ; tant qu’aucune source audio n’est raccordée, le lecteur affiche honnêtement `Audio à connecter`. Le lecteur réel, les fichiers audio, les archives et leur pagination devront être raccordés aux données administrées.

## 11. Vidéos

- Route du prototype : `/videos/`.
- La page reprend les trois catégories du cahier des charges : Prédications, Enseignements et Témoignages. Ces catégories restent administrables et extensibles dans le CMS.
- Les filtres `Toutes`, `Prédications`, `Enseignements` et `Témoignages` fonctionnent dans la maquette et filtrent la grille sans rechargement.
- Six emplacements sont prévus, soit deux par catégorie, conformément au cahier des charges. Ils restent volontairement identifiés `Vidéo à venir` tant que les vraies vidéos ne sont pas fournies.
- Pour chaque vidéo, Claude devra raccorder au minimum la catégorie, le titre, la vignette, l’URL YouTube et, si elle existe dans les données, la date ou une courte description.
- Le prototype n’intègre aucune vidéo fictive et ne modifie pas le principe de gestion existant.

## 12. Contact

- Route du prototype : `/contact/`.
- Respecter strictement le cahier des charges : formulaire seul, sans colonne d’informations annexe, avec quatre champs `Nom`, `E-mail`, `Sujet`, `Message` et un consentement relatif à la politique de confidentialité.
- Au développement, raccorder le formulaire au traitement existant et à Resend, puis rediriger vers la page de confirmation avec `?type=contact`.
- La maquette affiche un retour explicite de démonstration et n’envoie aucune donnée.

## 13. Partenariat et soutien

- Route : `/partenariat/`. Les liens `Partenariat` et `Soutenir` conduisent à cette même page.
- Le texte éditorial fourni est conservé sans réécriture. Il précède le module de don et explique le sens du partenariat.
- Le module propose les fréquences `Unique`, `Mensuel` et `Annuel`, les montants 10, 30, 60, 100, 250 et 500 euros, un montant libre et un commentaire facultatif limité à 100 caractères.
- Le bouton récapitule dynamiquement le montant et la fréquence choisis.
- Le paiement réel doit rester confié exclusivement à Stripe et aux contrôles serveur prévus. La maquette n’effectue aucun don fictif.
- La newsletter n’apparaît pas sur cette page, conformément au fonctionnement source.

## 14. Pages légales

- Routes : `/mentions-legales/`, `/politique-de-confidentialite/`, `/politique-de-cookies/` et `/termes-et-conditions/`.
- Elles sont reliées dans le pied de page et partagent une mise en page de lecture sobre, compacte et responsive.
- Les quatre textes juridiques ont été remplacés par les contenus transmis le 10 septembre 2026, sans réécriture éditoriale. Les sources exactes sont conservées dans `reference/contenus-juridiques-integres/`. Claude doit préserver ces textes et leur ordre ; seule la date de mise à jour reste à préciser lors de la mise en ligne.
- La politique de confidentialité doit conserver les prestataires réellement utilisés : Stripe, Vercel, MailerLite et Resend.
- Le bandeau de consentement et le dépôt réel des cookies ne sont pas simulés dans le prototype ; conserver le fonctionnement RGPD déjà présent dans l’application.

## 15. Fichiers du prototype et raccordements attendus

- `dist/styles.css` : système visuel général, en-tête, navigation, accueil et pages éditoriales.
- `dist/publications.css` : hubs, publications quotidiennes, pages article, hub Podcast et page Vidéos.
- `dist/commerce.css` : librairie, fiche livre, panier, connexion et espace personnel.
- `dist/engagement.css` : pages Invitation, Partenariat et Contact.
- `dist/site.js` : interactions générales de la maquette.
- `dist/commerce.js` : pagination visuelle du catalogue, panier de démonstration, onglets du compte et états des formulaires.
- `dist/engagement.js` : états d’interface des formulaires Invitation et Contact, ainsi que du module de don ; aucun envoi réel ni paiement n’y est simulé.
- Les fichiers HTML de `dist/`, dont `dist/podcast/index.html`, `dist/videos/index.html` et `dist/contact/index.html`, constituent les références de mise en page responsive. Ils ne doivent pas être interprétés comme une nouvelle architecture de données.
- Les routes `/boutique/`, `/boutique/t-shirt-voix-prophetique/`, `/confirmation/`, les quatre pages légales et les sept écrans du parcours Compte complètent le prototype. Claude doit mapper ces URL de démonstration vers le routeur réel plutôt que créer des doublons.
- Le dossier `gabarits-emails/` contient les références visuelles des e-mails ; ces fichiers ne doivent pas être servis comme pages publiques.

Pour l’intégration finale, Claude doit préserver les routes, les relations CMS, les champs, la pagination, les options d’articles similaires, le partage, Supabase, Stripe et les règles d’accès décrites dans le cahier des charges. Le prototype définit la couche d’interface et ses priorités visuelles.
