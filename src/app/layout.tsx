import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Наш будинок",
  description: "Telegram Mini App для мешканців будинку",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen pb-20">
        <main className="mx-auto max-w-md px-4 py-5">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
