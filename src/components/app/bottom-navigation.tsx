"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const items = [
  { href: "/", icon: "⌂", label: "Головна" },
  { href: "/issues", icon: "🔧", label: "Проблеми" },
  { href: "/announcements", icon: "📢", label: "Оголошення" },
  { href: "/polls", icon: "🗳", label: "Голосування" },
  { href: "/profile", icon: "👤", label: "Профіль" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Основна навігація" className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-[var(--tg-secondary-bg-color)]/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 px-1">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-center text-[11px] leading-3 transition-colors",
                isActive ? "font-semibold text-[var(--tg-link-color)]" : "text-[var(--tg-hint-color)]",
              )}
              href={item.href}
              key={item.href}
            >
              <span aria-hidden="true" className="text-lg leading-5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
