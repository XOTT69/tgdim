import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { PageHeading } from "@/components/app/page-heading";

export default function AdminPage() {
  return <><PageHeading description="Керування інформацією будинку" title="Адміністрування" /><AdminDashboard /></>;
}
