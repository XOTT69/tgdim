"use client";

import { useEffect } from "react";

import { applyTelegramTheme, getTelegramWebApp } from "@/lib/telegram";

export function TelegramProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      return;
    }

    const syncTheme = () => applyTelegramTheme(webApp);

    syncTheme();
    webApp.ready();
    webApp.expand();
    if (webApp.isVersionAtLeast?.("6.1")) {
      webApp.setHeaderColor?.("secondary_bg_color");
      webApp.setBackgroundColor?.("bg_color");
    }
    webApp.onEvent("themeChanged", syncTheme);

    return () => webApp.offEvent("themeChanged", syncTheme);
  }, []);

  return children;
}
