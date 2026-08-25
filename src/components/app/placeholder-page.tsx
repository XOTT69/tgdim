import { PageHeading } from "@/components/app/page-heading";
import { EmptyState } from "@/components/ui/empty-state";

type PlaceholderPageProps = {
  icon: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function PlaceholderPage({ icon, title, description, emptyTitle, emptyDescription }: PlaceholderPageProps) {
  return (
    <>
      <PageHeading description={description} title={title} />
      <EmptyState description={emptyDescription} icon={icon} title={emptyTitle} />
    </>
  );
}
