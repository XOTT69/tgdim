"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        ready: () => void;
        expand: () => void;
        themeParams: Record<string, string>;
        initDataUnsafe: { user?: { id: number; first_name: string; username?: string } };
      };
    };
  }
}

export function useTelegramWebApp() {
  const [initData, setInitData] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; first_name: string; username?: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setInitData(tg.initData);
      setUser(tg.initDataUnsafe.user ?? null);
    }
    setReady(true);
  }, []);

  return { initData, user, ready };
}

/** Хелпер для fetch-запитів з підписом initData */
export function tgFetch(initData: string | null, url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "x-telegram-init-data": initData ?? "",
    },
  });
}
