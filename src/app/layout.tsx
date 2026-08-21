import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Наш будинок",
  description: "Telegram Mini App для мешканців будинку",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-[var(--tg-theme-bg-color,#f8fafc)] min-h-screen">
        <main className="max-w-md mx-auto px-4 pt-4 pb-2">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
