# Livraison du code et publication quotidienne

Règles établies le 28 octobre 2026 à la demande de Serge Hapita.

## Contenus

La préparation conserve les validations texte puis image. Les fichiers finaux sont déposés dans « À publier » et publiés par le CMS existant. Aucun commit, push ni reconstruction n'est nécessaire pour une publication ou une retouche éditoriale. Le travail quotidien n'a pas le droit de changer le pipeline pour contourner un accès manquant : signaler l'erreur d'accès et reprendre uniquement l'étape échouée via le CMS.

Le cron `/api/cron/ready` est l'unique moteur automatique de mise en ligne. Il est appelé à 21 h et 22 h UTC, et son garde horaire n'autorise la publication qu'à 23 h dans `Europe/Paris`, avec la date locale du jour. Un appel est donc sans traitement métier selon la saison. La tâche ChatGPT contrôle le résultat ; elle ne lance pas une deuxième publication. Le mécanisme existant de détection d'une version déjà publiée et les verrous sont conservés.

## Code

1. Lire AGENTS.md, examiner la version réellement servie et la tête de branche.
2. Regrouper le lot complet ; lancer les tests concernés et une compilation locale complète quand le checkout le permet. Un checkout partiel ne constitue pas une compilation complète : déclarer cette limite.
3. Effectuer un seul commit et un seul push (ou mise à jour de ref) pour le lot. Ne pas publier chaque étape intermédiaire.
4. Les previews des branches d'automatisation et de contenu sont ignorées. Les autres branches de développement conservent leurs previews utiles.
5. Choisir un canal de production : push/merge sur la branche de production Git, OU un appel API explicite pour une version non déployée automatiquement. Vérifier d'abord si ce SHA a déjà une production prête/en cours ; ne pas doubler. Le projet sert actuellement `feature/automatisation-editoriale-shm` par publication explicite ; ne pas fusionner tous ses changements sur main sans mandat distinct.
6. Le build exécute uniquement `npm run build`. Les tests restent hors des effets de publication. Toute synchronisation Drive, script daté de retouche ou publication pendant le build est interdite.
7. Inspecter statut et logs, puis vérifier les pages publiques. En cas d'échec, interrompre les relances jusqu'au diagnostic et à la correction testée.

## Traçabilité

Dans le compte rendu de livraison, enregistrer le SHA exact, la branche, les tests et leurs limites, le canal de déclenchement, l'identifiant Vercel et son état. Ne pas inscrire de secrets ou de données de facturation dans le dépôt.

L'origine historique du second canal de déploiement n'est pas identifiée. Cette règle empêche les assistants qui la suivent de créer le doublon ; elle ne prouve pas la suppression d'un déclencheur externe inconnu.
