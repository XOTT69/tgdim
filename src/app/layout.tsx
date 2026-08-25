import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { AuthProvider } from "@/components/auth/auth-provider";
import { TelegramProvider } from "@/components/telegram/telegram-provider";
import { TELEGRAM_SDK_URL } from "@/lib/telegram";

import "./globals.css";

export const metadata: Metadata = {
  title: "Наш будинок",
  description: "Telegram Mini App для мешканців будинку",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <Script src={TELEGRAM_SDK_URL} strategy="beforeInteractive" />
        <TelegramProvider><AuthProvider>{children}</AuthProvider></TelegramProvider>
      </body>
    </html>
  );
}
