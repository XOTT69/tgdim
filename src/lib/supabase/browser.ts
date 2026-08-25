"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "@/lib/env";

let client: SupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  const config = getPublicSupabaseConfig();
  if (!config) {
    return null;
  }

  client ??= createBrowserClient(config.url, config.anonKey);
  return client;
}
