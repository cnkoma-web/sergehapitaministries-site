import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linkPreparedAnonymousOrdersToCurrentAccount } from "@/lib/orders/actions";

function safeDestination(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/mon-compte";
}

function metadataName(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = safeDestination(request.nextUrl.searchParams.get("next"));
  const errorDestination = new URL("/compte?oauth_error=1", request.nextUrl.origin);

  if (!code) return NextResponse.redirect(errorDestination);

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("[oauth] Échange du code impossible :", exchangeError.message);
    return NextResponse.redirect(errorDestination);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Google et Meta n'emploient pas exactement les mêmes clés de profil. On
  // complète uniquement les champs encore vides et on ne remplace jamais un
  // nom saisi auparavant par l'utilisateur.
  if (user && !user.is_anonymous) {
    const metadata = user.user_metadata as Record<string, unknown>;
    let firstName = metadataName(metadata, ["first_name", "given_name"]);
    let lastName = metadataName(metadata, ["last_name", "family_name"]);
    const fullName = metadataName(metadata, ["full_name", "name"]);
    if ((!firstName || !lastName) && fullName) {
      const [first, ...rest] = fullName.split(/\s+/);
      firstName ||= first ?? "";
      lastName ||= rest.join(" ");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();
    const profileUpdate = {
      first_name: profile?.first_name || firstName || null,
      last_name: profile?.last_name || lastName || null,
    };
    if (profileUpdate.first_name !== profile?.first_name || profileUpdate.last_name !== profile?.last_name) {
      const { error: profileError } = await supabase.from("profiles").update(profileUpdate).eq("id", user.id);
      if (profileError) console.error("[oauth] Profil social non synchronisé :", profileError.message);
    }
  }

  let transfer = { linked: 0, merged: 0, error: undefined as string | undefined };
  try {
    transfer = await linkPreparedAnonymousOrdersToCurrentAccount();
  } catch (transferError) {
    console.error("[oauth] Transfert des données anonymes impossible :", transferError);
    transfer.error = "transfer-failed";
  }

  const next = transfer.linked > 0 ? "/mon-compte?section=commandes" : destination;
  const redirectUrl = new URL(next, request.nextUrl.origin);
  if (transfer.error) redirectUrl.searchParams.set("transfer_error", "1");
  return NextResponse.redirect(redirectUrl);
}
