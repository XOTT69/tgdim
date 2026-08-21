"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Головна", icon: "🏠" },
  { href: "/issues", label: "Проблеми", icon: "🔧" },
  { href: "/announcements", label: "Оголошення", icon: "📢" },
  { href: "/polls", label: "Голосування", icon: "🗳" },
  { href: "/profile", label: "Профіль", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Основна навігація" className="fixed bottom-0 left-0 right-0 z-10 mx-auto flex max-w-md justify-around border-t border-slate-200 bg-white/95 py-2 backdrop-blur">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-[56px] flex-col items-center rounded-lg px-2 py-1 text-xs ${
              active ? "text-blue-600 font-semibold" : "text-gray-500"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
