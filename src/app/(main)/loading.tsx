import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-label="Завантаження" className="space-y-4" role="status">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}
