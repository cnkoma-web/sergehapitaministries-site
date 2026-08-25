"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Assure qu'une session existe pour TOUT visiteur (connecté ou non), via les
// sessions anonymes Supabase — nécessaire pour que le panier persiste sans
// obliger à créer un compte. Échoue silencieusement si "Allow anonymous
// sign-ins" n'est pas encore activé côté Supabase (le site continue de
// fonctionner, le panier ne persistera simplement pas encore pour les
// visiteurs non connectés).
export default function CartSessionBootstrap() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) return;
      supabase.auth.signInAnonymously().then(({ error }) => {
        if (!error) router.refresh();
      });
    });
  }, [router]);

  return null;
}
