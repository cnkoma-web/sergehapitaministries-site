"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { isRealUser } from "@/lib/supabase/realUser";
import { allowSubmission } from "@/lib/security/rateLimit";
import { verifyHumanForm } from "@/lib/security/turnstile";
import { optionalText, PublicFormError } from "@/lib/security/validation";

type Result = { ok: true } | { ok: false; error: string };

export async function submitReview(formData: FormData): Promise<Result> {
  if (!(await verifyHumanForm(formData, "review"))) {
    return { ok: false, error: "La vérification de sécurité a échoué. Actualisez la page et réessayez." };
  }

  try {
    const bookId = optionalText(formData, "book_id", 36);
    const goodieId = optionalText(formData, "goodie_id", 36);
    const authorName = optionalText(formData, "author_name", 120);
    const body = optionalText(formData, "body", 2000);
    const ratingValue = Number(formData.get("rating"));
    const rating = Number.isInteger(ratingValue) && ratingValue >= 1 && ratingValue <= 5 ? ratingValue : null;

    if (Boolean(bookId) === Boolean(goodieId) || (!rating && !body)) {
      throw new PublicFormError();
    }

    const sessionClient = await createClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    const allowed = await allowSubmission({
      scope: "review",
      limit: 5,
      windowSeconds: 86400,
      identity: user?.id,
    });
    if (!allowed) {
      return { ok: false, error: "Trop d'avis ont été envoyés récemment. Réessayez plus tard." };
    }

    const service = createServiceRoleClient();
    const { error } = await service.from("reviews").insert({
      book_id: bookId,
      goodie_id: goodieId,
      user_id: isRealUser(user) ? user.id : null,
      author_name: authorName,
      rating,
      body,
      status: "pending",
    });
    if (error) {
      console.error("[reviews] Insertion refusée :", error.message);
      return { ok: false, error: "Impossible d'envoyer votre avis pour le moment. Réessayez plus tard." };
    }

    return { ok: true };
  } catch (error) {
    if (error instanceof PublicFormError) {
      return { ok: false, error: "Les informations transmises ne sont pas valides." };
    }
    console.error("[reviews] Soumission impossible :", error);
    return { ok: false, error: "Impossible d'envoyer votre avis pour le moment. Réessayez plus tard." };
  }
}
