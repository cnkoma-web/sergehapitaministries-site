"use client";

import { useState, useTransition } from "react";
import { likeArticlePublic, likeArticleAuthenticated } from "@/lib/likes/actions";
import { useIsLikedLocally, markLikedLocally } from "@/lib/likes/useLikedLocally";
import type { ShareCategory } from "@/lib/share";

// Bouton "J'aime" (retour du 05/09, 2e passage — Option 3 des propositions
// soumises à Serge) — plus un bouton façon "réseau social" (icône dans un
// contour), mais une phrase d'invitation éditoriale suivie du bouton
// lui-même, sans fond ni bordure : dans le ton "phrase de contenu" du reste
// du site plutôt qu'un élément d'interface étranger.
const INVITE_PHRASE: Record<ShareCategory, string> = {
  qdlb: "Cette parole vous a béni ?",
  vs: "Cet enseignement vous a béni ?",
  rm: "Cette pensée vous a béni ?",
};

// Deux modes, calqués sur l'accès déjà en place pour la lecture de
// l'article :
// - "public" (Que Dit la Bible, Rosée Matinale) : accessible à tout le
//   monde, compteur simple. Dédoublonné côté navigateur uniquement
//   (useIsLikedLocally) — pas de compte à associer à un like ici.
// - "authenticated" (La Vie Supérieure) : réservé aux comptes connectés,
//   comme la lecture elle-même. Dédoublonné pour de vrai en base
//   (contrainte unique sur article_likes) — initiallyLiked vient d'une
//   vraie lecture serveur (hasUserLikedArticle) au chargement de la page,
//   pas d'un stockage local.
// Dans les deux cas : une fois aimé, l'action est définitive pour ce
// visiteur/compte — pas de bouton pour "désaimer" (décision prise avec
// Serge).
export default function LikeButton({
  articleId,
  initialCount,
  mode,
  category,
  initiallyLiked = false,
}: {
  articleId: string;
  initialCount: number;
  mode: "public" | "authenticated";
  category: ShareCategory;
  initiallyLiked?: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [likedNow, setLikedNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const likedLocally = useIsLikedLocally(articleId);
  const liked = mode === "public" ? likedLocally || likedNow : initiallyLiked || likedNow;

  function handleClick() {
    if (liked || isPending) return;
    setError(null);
    startTransition(async () => {
      if (mode === "public") {
        const result = await likeArticlePublic(articleId);
        if (result.error) {
          setError("Une erreur est survenue, réessayez.");
          return;
        }
        markLikedLocally(articleId);
        setCount((c) => c + 1);
        setLikedNow(true);
      } else {
        const result = await likeArticleAuthenticated(articleId);
        if (result.error === "auth-required") {
          setError("Connectez-vous pour aimer cet article.");
          return;
        }
        if (result.error) {
          setError("Une erreur est survenue, réessayez.");
          return;
        }
        if (result.liked) setCount((c) => c + 1);
        setLikedNow(true);
      }
    });
  }

  return (
    <div className="like-block">
      <span className="like-invite">{INVITE_PHRASE[category]}</span>
      <button
        type="button"
        className={`like-button${liked ? " liked" : ""}`}
        onClick={handleClick}
        disabled={liked || isPending}
        aria-pressed={liked}
      >
        <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-6.7-4.35-9.3-8.2C1 10.1 1.6 6.6 4.6 5.1c2.4-1.2 5-.3 6.4 1.7l1 1.4 1-1.4c1.4-2 4-2.9 6.4-1.7 3 1.5 3.6 5 1.9 7.7C18.7 16.65 12 21 12 21Z" />
        </svg>
        <span>J&apos;aime ({count})</span>
      </button>
      {error && <p className="like-error">{error}</p>}
    </div>
  );
}
