export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      user?: TelegramWebAppUser;
    };
    colorScheme: "light" | "dark";
    version?: string;
    themeParams: Record<string, string | undefined>;
    isExpanded: boolean;
    ready: () => void;
    expand: () => void;
    setHeaderColor?: (color: string) => void;
    setBackgroundColor?: (color: string) => void;
    isVersionAtLeast?: (version: string) => boolean;
    onEvent: (eventType: "themeChanged" | "viewportChanged", eventHandler: () => void) => void;
    offEvent: (eventType: "themeChanged" | "viewportChanged", eventHandler: () => void) => void;
  }

  interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  }
}
