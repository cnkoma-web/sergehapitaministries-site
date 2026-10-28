# Consignes permanentes pour Claude — économie des builds Vercel

## 0. Responsabilité sur ce dépôt
- `sergehapitaministries-site` et son automatisation sont sous la responsabilité de
  GPT / Workflow, qui applique ses propres règles. Une session Claude n'y intervient
  que sur demande explicite de Serge, sur sa propre branche `claude/…`, sans fusion
  dans `main`, sans déploiement et sans modifier la configuration Vercel ou
  l'automatisation existante.
- Les règles ci-dessous s'imposent aux sessions Claude ; elles sont proposées, non
  imposées, aux autres intervenants.

Contexte (28 oct. 2026) : les sites de l'équipe Vercel « adfdd » ont été suspendus
après dépassement du crédit mensuel partagé (20 $). 86 % de la dépense venait des
builds. Chaque push sur une branche reliée à Vercel et chaque « redeploy » lance un
build payant, y compris pour un SHA déjà construit. Ces règles s'appliquent à toutes
les sessions, sur ce dépôt comme sur les autres projets de l'équipe (ne-de-dieu,
secupass, secupass-tfp-aps…).

## 1. Un seul push par lot de travail
- Travailler en commits locaux ; pousser **une fois**, quand le lot est terminé et vérifié.
- Ne jamais pousser après chaque petite correction, ni « pour voir le rendu ».
- Ne jamais créer de commit par fichier (API GitHub `create_or_update_file` en série) :
  un lot = un push (`git push` ou `push_files` en un seul appel).
- Pas de commit vide, pas de push « pour relancer » un build.

## 2. Tester en local avant de pousser
- Dans `site/` : `npm run lint` puis `npm run build` (ou `npx tsc --noEmit` si le build
  local est impossible). Corriger tout échec avant de pousser.
- Vérifier le rendu en local (`npm run dev` + navigateur headless) au lieu de
  s'appuyer sur un déploiement de prévisualisation.
- Un build qui échoue sur Vercel est payé quand même : il ne doit jamais servir de test.

## 3. Ne jamais redéployer un SHA inchangé
- Avant tout redeploy ou déploiement manuel, vérifier (via `list_deployments` filtré
  par `sha`) qu'un déploiement READY n'existe pas déjà pour ce commit.
- Ne pas lancer de déploiement de production par API/connecteur si le push sur `main`
  en déclenche déjà un.

## 4. Variables d'environnement : grouper, puis un seul redeploy
- Rassembler **toutes** les variables à ajouter ou modifier, les enregistrer toutes,
  puis faire **un seul** redeploy à la fin (ou mieux : laisser le prochain push de code
  les prendre en compte, sans redeploy).
- Si un push de code est prévu dans la foulée, ne pas redéployer : le push suffit.
- Ne jamais redéployer un ancien SHA juste avant de pousser un nouveau commit.
- Rappeler cette règle à Serge avant qu'il modifie des variables dans le tableau de bord.

## 5. Garde-fou technique en place
- `site/vercel.json` déclare un Ignored Build Step (`site/scripts/vercel-ignore-build.sh`) :
  un push qui ne modifie rien dans `site/` (documentation, maquettes HTML racine,
  audits…) ne lance pas de build. En cas de doute, le script laisse construire.
- Ne pas retirer ce garde-fou sans accord explicite.

## 6. Avant d'agir sur Vercel
- Ne jamais réactiver un projet suspendu, changer un plan ou un plafond de dépense,
  sans accord explicite de Serge.
- Signaler le coût d'une action (nombre de builds attendus) avant de la lancer.
