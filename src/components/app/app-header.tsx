import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-[var(--tg-bg-color)]/95 px-4 py-3 backdrop-blur">
      <Link aria-label="На головну" className="inline-flex items-center gap-2" href="/">
        <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl bg-[var(--tg-button-color)] text-lg">⌂</span>
        <span className="text-base font-bold tracking-tight text-[var(--tg-text-color)]">Наш будинок</span>
      </Link>
    </header>
  );
}
