"use client";

import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignedImage({ bucket, path, alt }: { bucket: string; path: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    void client.storage.from(bucket).createSignedUrl(path, 60 * 60).then(({ data }) => {
      if (active) setUrl(data?.signedUrl ?? null);
    });
    return () => { active = false; };
  }, [bucket, path]);
  if (!url) return null;
  // Storage only returns a short-lived URL after the authenticated client passes RLS.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} className="mt-3 max-h-72 w-full rounded-xl object-cover" src={url} />;
}
