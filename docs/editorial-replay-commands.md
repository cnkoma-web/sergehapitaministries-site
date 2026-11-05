# Reprises CMS autorisées depuis la connexion administrative

Le moteur régulier /api/cron/ready reste programmé à 23 h Europe/Paris et vise la date civile J+1. Son authentification CRON_SECRET reste inchangée. Le build compile seulement le site.

Le jeton permanent CRON_SECRET déjà configuré dans Vercel reste exclusivement côté serveur. Les tâches utilisent leur connexion administrative permanente pour émettre automatiquement les autorisations de rattrapage temporaires ; aucune intervention de Serge ni nouvelle approbation n’est requise pour chaque passage déjà autorisé. Aucun jeton permanent ne doit figurer dans les liens ou les journaux.

Serge a explicitement approuvé le 1 novembre 2026 le raccordement avec jeton temporaire dans le lien, après information du risque de journalisation, et demandé un accès durable pour les automatismes.

Pour reprendre un passage manqué sans session de navigateur ni extraction de secret :
1. Vérifier dans articles, editorial_jobs et editorial_commands l'existant et les verrous de la date choisie. Réutiliser une commande active plutôt que créer une exécution concurrente.
2. Après confirmation que les contenus finaux sont validés dans À publier, créer via la connexion Supabase administrative une ligne editorial_commands(article_date, requested_by, authorization_hash). Ne jamais écrire directement dans articles.
3. Générer un jeton cryptographiquement aléatoire de 32 octets et stocker seulement son SHA-256 dans authorization_hash. La base génère l'identifiant et une expiration de quinze minutes. La table n'accorde aucun accès à anon/authenticated ; RLS est activé. La connexion administrative et le serveur sont seuls habilités à créer les commandes.
4. Appeler https://sergehapitaministries.org/api/editorial/execute?id=IDENTIFIANT&authorization=JETON_TEMPORAIRE par la connexion Vercel. Cet appel ne peut créer une commande ni modifier sa date/action. Le serveur vérifie le SHA-256 du jeton avec une comparaison constante, sa date d’expiration et la prise exclusive. Un identifiant seul ne permet rien. Ne jamais publier le jeton ni le lien de commande.
5. Le serveur prend exclusivement la commande, appelle publishReadyDrive, puis les actions natives via publishThroughCms. Un second appel renvoie le résultat enregistré. Une commande inconnue, expirée, une date future hors fenêtre, ou une exécution en preview ne publie rien.
6. Lire success/outcomes et vérifier les trois pages publiques, contenu et image. L'état completed d'une commande ne remplace pas le contrôle public.
7. Une erreur partielle ne justifie pas un nouveau build : relire les erreurs et les articles existants, puis créer une nouvelle commande uniquement pour reprendre les éléments manquants. Ne pas relancer une commande running dont le traitement et les verrous sont encore actifs.

Exemple d'admission (remplacer DATE par la date vérifiée ; aucune clé n'est fournie) :
```sql
insert into public.editorial_commands(article_date,requested_by,authorization_hash)
values ('DATE','publication-shm-23h','SHA256_DU_JETON_TEMPORAIRE')
returning id,article_date,status,expires_at;
```

Les images absentes, ambiguës ou momentanément indisponibles n'empêchent pas la publication du texte validé. Elles peuvent être complétées ensuite sur le même article. Une version déjà publiée inchangée conserve ses corrections CMS.

Livraison du 1 novembre 2026 :
- Session Codex 2b20586528f8 ; reprise demandée par Serge après réussite du build de test 4f6ca4a.
- Base de production contrôlée : 82de9f00ddb59870a84880be05ecf95922221d7b.
- Commit de preview validé : 4f6ca4a2cd147757f58fa8ab12cd7d7d4fd05dff (compilation et typage complets, accès serveur réel aux trois textes/images du 29).
- Nouveau lot : commande temporaire, prise exclusive, transport via les connexions existantes, texte indépendant de l'image, parcours limité au dossier de la date.
- 27 tests locaux passent, dont la lecture des documents réels. Aucun document privé ni secret n'est inclus.
- Canal de livraison unique : API, SHA isolé sans mise à jour de branche ; aucune publication de contenu pendant le build.

