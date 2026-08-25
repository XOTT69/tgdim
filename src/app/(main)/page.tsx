import { PageHeading } from "@/components/app/page-heading";
import { HomeDashboard } from "@/components/home/home-dashboard";

export default function HomePage() {
  return (
    <>
      <PageHeading description="Усе важливе для вашого будинку" title="Вітаємо" />
      <HomeDashboard />
    </>
  );
}
