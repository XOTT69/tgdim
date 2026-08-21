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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 max-w-md mx-auto">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center text-xs px-2 py-1 min-w-[56px] ${
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
