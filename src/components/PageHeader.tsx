import Link from "next/link";

export default function PageHeader({ title, action }: { title: string; action?: { href: string; label: string } }) {
  return <div className="mb-5 flex items-center justify-between gap-3"><h1 className="text-xl font-bold">{title}</h1>{action && <Link href={action.href} className="primary-button text-sm">{action.label}</Link>}</div>;
}
