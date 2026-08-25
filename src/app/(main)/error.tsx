"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function MainError({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      action={<Button onClick={reset}>Спробувати ще раз</Button>}
      description="Не вдалося завантажити цей розділ. Перевірте з’єднання та повторіть спробу."
      icon="⚠️"
      title="Щось пішло не так"
    />
  );
}
