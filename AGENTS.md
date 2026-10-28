# Workflow de publication et maîtrise des constructions

Lire `docs/deployment-workflow.md` avant toute publication, modification de pipeline ou déploiement Vercel. Ces règles concernent tous les assistants travaillant dans ce dépôt.

- Les articles quotidiens sont des données du CMS : aucun commit, push ou build pour publier ou corriger un contenu.
- Pour une évolution du code : préparer et tester le lot complet localement, puis un seul commit et une seule mise à jour de branche pour ce lot. Aucun push par étape ou fichier.
- Aucun script de publication, synchronisation Drive ou retouche datée dans build/install/postinstall. `npm run build` compile seulement le site.
- Aucun déploiement manuel/API après chaque push. Un seul canal par livraison : Git automatique OU une publication API explicite, jamais les deux pour le même lot/environnement.
- Aucun déclencheur ponctuel ajouté puis retiré dans le code ou le cron. Utiliser le CMS existant, sans reconstruire le site.
- Après un échec, lire les logs, corriger et tester la cause avant toute nouvelle tentative. Aucun retry aveugle, aucun contournement par un nouveau commit.
- Maintenir le cache. Ne pas utiliser `force` ou désactiver le cache sans cause établie.
- Conserver la publication des contenus finaux validés à minuit, fuseau `Europe/Paris`, ainsi que les identifiants, URL, images, validations et fonctions utiles du CMS.
- Tracer pour chaque livraison : assistant/session, commit, branche, tests, canal Git/API, identifiant du déploiement et résultat. Ne pas déduire l'auteur d'un nom de branche ou d'un compte partagé.
