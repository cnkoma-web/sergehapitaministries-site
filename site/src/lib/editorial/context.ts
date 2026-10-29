import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";

// Scope limité aux actions de publication. Ni le client général ni Auth ne changent.
const scope = new AsyncLocalStorage<SupabaseClient>();
export async function createPublicationClient() {
  return scope.getStore() ?? createSessionClient();
}
export function withPublicationClient<T>(client: SupabaseClient, action: () => Promise<T>) {
  return scope.run(client, action);
}
