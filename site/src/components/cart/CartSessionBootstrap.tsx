"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TurnstileWidget from "@/components/security/TurnstileWidget";

// Assure qu'une session existe pour TOUT visiteur (connecté ou non), via les
// sessions anonymes Supabase — nécessaire pour que le panier persiste sans
// obliger à créer un compte. Échoue silencieusement si "Allow anonymous
// sign-ins" n'est pas encore activé côté Supabase (le site continue de
// fonctionner, le panier ne persistera simplement pas encore pour les
// visiteurs non connectés).
export default function CartSessionBootstrap() {
  const router = useRouter();
  const [needsSession, setNeedsSession] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const attemptingRef = useRef(false);
  const retryCountRef = useRef(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) return;
      setNeedsSession(true);
    });
  }, []);

  const createAnonymousSession = useCallback(async (captchaToken: string) => {
    if (!captchaToken || attemptingRef.current) return;
    attemptingRef.current = true;
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously({ options: { captchaToken } });
    attemptingRef.current = false;
    if (!error) {
      setNeedsSession(false);
      router.refresh();
    } else {
      console.warn("[cart] Session anonyme protégée non créée :", error.code);
      if (retryCountRef.current < 1) {
        retryCountRef.current += 1;
        setCaptchaReset((value) => value + 1);
      }
    }
  }, [router]);

  if (!needsSession) return null;
  return (
    <TurnstileWidget
      action="anonymous_session"
      name={false}
      onToken={createAnonymousSession}
      resetSignal={captchaReset}
    />
  );
}
