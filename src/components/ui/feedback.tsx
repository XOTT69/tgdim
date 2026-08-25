import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function ListLoading() {
  return <div aria-label="Завантаження" className="space-y-3" role="status"><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div>;
}

export function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <EmptyState action={<Button onClick={onRetry}>Повторити</Button>} description={message} icon="⚠️" title="Не вдалося завантажити" />;
}
