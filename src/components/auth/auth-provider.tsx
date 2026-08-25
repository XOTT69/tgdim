"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getPublicSupabaseConfig } from "@/lib/env";
import { getTelegramWebApp } from "@/lib/telegram";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Profile } from "@/types/database";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  user: null,
  profile: null,
  error: null,
  refreshProfile: async () => undefined,
});

type BootstrapResponse = {
  email?: string;
  tokenHash?: string;
  error?: string;
};

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<AuthContextValue>({ status: "loading", user: null, profile: null, error: null, refreshProfile: async () => undefined });

  const refreshProfile = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    const userId = state.user?.id;
    if (!client || !userId) {
      return;
    }
    const { data, error } = await client.from("profiles").select("*").eq("id", userId).single();
    if (error) {
      throw error;
    }
    setState((previous) => ({ ...previous, profile: data as Profile }));
  }, [state.user?.id]);

  useEffect(() => {
    let active = true;
    const client = getSupabaseBrowserClient();

    async function bootstrap() {
      if (!getPublicSupabaseConfig()) {
        if (active) {
          setState((previous) => ({ ...previous, status: "error", user: null, profile: null, error: "Застосунок ще не налаштований." }));
        }
        return;
      }

      if (!client) {
        return;
      }

      const { data: existingSession } = await client.auth.getSession();
      if (existingSession.session) {
        if (active) {
          setState((previous) => ({ ...previous, status: "authenticated", user: existingSession.session.user, error: null }));
          const { data: profile } = await client.from("profiles").select("*").eq("id", existingSession.session.user.id).single();
          if (active && profile) {
            setState((previous) => ({ ...previous, profile: profile as Profile }));
          }
        }
        return;
      }

      const initData = getTelegramWebApp()?.initData;
      if (!initData) {
        if (active) {
          setState((previous) => ({ ...previous, status: "unauthenticated", user: null, profile: null, error: "Відкрийте застосунок через Telegram." }));
        }
        return;
      }

      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        const payload = (await response.json()) as BootstrapResponse;
        if (!response.ok || !payload.email || !payload.tokenHash) {
          throw new Error(payload.error ?? "Не вдалося підтвердити дані Telegram.");
        }

        const { data, error } = await client.auth.verifyOtp({
          email: payload.email,
          token_hash: payload.tokenHash,
          type: "magiclink",
        });
        if (error || !data.user) {
          throw error ?? new Error("Не вдалося створити сесію.");
        }

        if (active) {
          setState((previous) => ({ ...previous, status: "authenticated", user: data.user, error: null }));
          const { data: profile } = await client.from("profiles").select("*").eq("id", data.user.id).single();
          if (profile) {
            setState((previous) => ({ ...previous, profile: profile as Profile }));
          }
        }
      } catch (error) {
        if (active) {
          setState((previous) => ({
            ...previous,
            status: "error",
            user: null,
            profile: null,
            error: error instanceof Error ? error.message : "Не вдалося авторизуватися.",
          }));
        }
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ ...state, refreshProfile }), [refreshProfile, state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
