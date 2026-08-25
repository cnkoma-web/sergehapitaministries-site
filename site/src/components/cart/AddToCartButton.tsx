"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addToCart } from "@/lib/cart/actions";

type Props = {
  bookId?: string;
  goodieId?: string;
  variantSize?: string;
  variantColor?: string;
  className?: string;
  label?: string;
  addedLabel?: string;
};

export default function AddToCartButton({ bookId, goodieId, variantSize, variantColor, className, label = "Ajouter", addedLabel = "Ajouté ✓" }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");

  async function handleClick() {
    setState("loading");
    let result = await addToCart({ bookId, goodieId, variantSize, variantColor });

    if (result.error === "no-session") {
      // Course possible tout au tout premier chargement, avant que
      // CartSessionBootstrap n'ait fini d'établir la session anonyme.
      const supabase = createClient();
      await supabase.auth.signInAnonymously();
      result = await addToCart({ bookId, goodieId, variantSize, variantColor });
    }

    setState("added");
    router.refresh();
    setTimeout(() => setState("idle"), 1200);
  }

  return (
    <button className={className} onClick={handleClick} disabled={state === "loading"}>
      {state === "added" ? addedLabel : label}
    </button>
  );
}
