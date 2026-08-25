export const TELEGRAM_SDK_URL = "https://telegram.org/js/telegram-web-app.js";

export function getTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.Telegram?.WebApp;
}

export function applyTelegramTheme(webApp: TelegramWebApp) {
  const root = document.documentElement;
  const theme = webApp.themeParams;

  const colors: Record<string, string | undefined> = {
    "--tg-bg-color": theme.bg_color,
    "--tg-secondary-bg-color": theme.secondary_bg_color,
    "--tg-text-color": theme.text_color,
    "--tg-hint-color": theme.hint_color,
    "--tg-link-color": theme.link_color,
    "--tg-button-color": theme.button_color,
    "--tg-button-text-color": theme.button_text_color,
    "--tg-destructive-text-color": theme.destructive_text_color,
  };

  for (const [property, value] of Object.entries(colors)) {
    if (value) {
      root.style.setProperty(property, value);
    }
  }

  root.dataset.telegramTheme = webApp.colorScheme;
}
