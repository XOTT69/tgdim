type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getServerAuthConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicConfig = getPublicSupabaseConfig();

  if (!botToken || !serviceRoleKey || !publicConfig) {
    throw new Error("Server authentication environment variables are not configured.");
  }

  return { ...publicConfig, botToken, serviceRoleKey };
}

export function getTelegramAdminIds() {
  return new Set(
    (process.env.TELEGRAM_ADMIN_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => /^\d+$/.test(value)),
  );
}
