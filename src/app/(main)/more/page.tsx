import { PageHeading } from "@/components/app/page-heading";
import { SectionCard } from "@/components/app/section-card";

const modules = [
  { icon: "🔎", title: "Знахідки", description: "Ключі, документи та інші загублені речі.", href: "/found-lost" },
  { icon: "🛠", title: "Майстри", description: "Рекомендації перевірених фахівців.", href: "/masters" },
  { icon: "🤝", title: "Допомога", description: "Попросити допомогу або запропонувати свою.", href: "/help" },
  { icon: "📅", title: "Події", description: "Зустрічі та спільні справи будинку.", href: "/events" },
];

export default function MorePage() {
  return (
    <>
      <PageHeading description="Корисні розділи для мешканців" title="Ще" />
      <div className="space-y-3">{modules.map((module) => <SectionCard {...module} key={module.href} />)}</div>
    </>
  );
}
