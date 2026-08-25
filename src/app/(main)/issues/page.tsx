import { PageHeading } from "@/components/app/page-heading";
import { IssuesScreen } from "@/components/issues/issues-screen";

export default function IssuesPage() {
  return <><PageHeading description="Несправності та їхній статус" title="Проблеми" /><IssuesScreen /></>;
}
