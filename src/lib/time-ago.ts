import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: uk });
}
