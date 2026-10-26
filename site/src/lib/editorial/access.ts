import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
export function validBearer(request: Request, key: string | undefined) {
  if (!key || key.length < 32) return false;
  const value = request.headers.get("authorization") ?? "";
  const expected = "Bearer " + key;
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
export async function editorialAccess(request: Request, date?: string) {
  // Accès opérateur temporaire, limité à la date de rattrapage configurée.
  if (validBearer(request, process.env.EDITORIAL_OPERATOR_SECRET)) {
    if (!date || date !== process.env.EDITORIAL_OPERATOR_DATE) throw new Error("Opérateur non autorisé pour cette date.");
    return { db: createServiceRoleClient(), actor: "operator:" + date };
  }
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Accès administrateur requis.");
  return { db: await createClient(), actor: admin.user.id };
}
