"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function uploadImage(bucket: string, prefix: string, userId: string, file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Підтримуються лише JPEG, PNG або WebP.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Розмір зображення не може перевищувати 5 МБ.");
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase не налаштовано.");
  }
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${prefix}/${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    throw error;
  }
  return path;
}
