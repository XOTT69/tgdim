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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2 px-1 max-w-md mx-auto safe-bottom">
        {items.map((item) => {
          const isHome = item.href === "/";
          const isActive = isHome
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center text-[10px] py-1 px-1 min-w-0 flex-1 ${
                isActive ? "text-blue-600 font-semibold" : "text-gray-500"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="mt-0.5 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
