import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
export default function LostFoundPage() { return <><PageHeader title="Знахідки" action={{ href: "#new", label: "+ Додати" }} /><div className="card"><div className="text-2xl">🔑</div><h2 className="mt-2 font-semibold">Знайдено ключі</h2><p className="mt-1 text-sm text-slate-600">Біля лавки у дворі. Напишіть у чат будинку, якщо це ваші.</p><p className="mt-3 text-xs text-slate-400">Сьогодні · Знайдено</p></div><EmptyState text="Інших оголошень поки немає" /></>; }
