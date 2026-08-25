import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerAuthConfig } from "@/lib/env";

export function getSupabaseAdminClient() {
  const { serviceRoleKey, url } = getServerAuthConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
