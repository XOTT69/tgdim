"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Megaphone, Vote, User } from "lucide-react";

const items = [
  { href: "/", label: "Головна", Icon: Home },
  { href: "/issues", label: "Проблеми", Icon: Wrench },
  { href: "/announcements", label: "Новини", Icon: Megaphone },
  { href: "/polls", label: "Голосування", Icon: Vote },
  { href: "/profile", label: "Профіль", Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 z-50">
      <div className="flex justify-around items-center py-1.5 px-2 max-w-md mx-auto safe-bottom">
        {items.map((item) => {
          const isHome = item.href === "/";
          const isActive = isHome
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 min-w-0 flex-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-400 active:text-slate-600"
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all duration-200 ${isActive ? "bg-blue-50" : ""}`}>
                <item.Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] mt-0.5 transition-all ${isActive ? "font-semibold" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
