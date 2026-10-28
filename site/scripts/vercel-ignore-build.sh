#!/usr/bin/env bash
# Ignored Build Step de Vercel (appelé via "ignoreCommand" dans vercel.json).
# Code de sortie : 0 = build ignoré, 1 = build lancé.
# Règle : on n'ignore que si l'on est CERTAIN que rien n'a changé dans site/
# depuis le dernier déploiement réussi de la branche. Au moindre doute, on construit.
set -u

prev="${VERCEL_GIT_PREVIOUS_SHA:-}"

# Premier déploiement de la branche : on construit.
[ -n "$prev" ] || exit 1

# Commit précédent absent du clone (clone superficiel) : on construit.
git cat-file -e "${prev}^{commit}" 2>/dev/null || exit 1

if git diff --quiet "$prev" HEAD -- . ; then
  echo "Aucun changement dans site/ depuis ${prev} : build ignoré."
  exit 0
fi

exit 1
