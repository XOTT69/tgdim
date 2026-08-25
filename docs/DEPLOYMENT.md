# Розгортання на Vercel

1. Створіть Supabase-проєкт, виконайте `supabase link --project-ref <project-ref>` і `supabase db push`.
2. Імпортуйте Git-репозиторій у Vercel. Build command: `npm run build`.
3. У Vercel додайте значення з `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_ADMIN_IDS`
4. Ніколи не додавайте service-role key або bot token до клієнтських `NEXT_PUBLIC_*` змінних.
5. Після deploy оновіть URL menu button у BotFather/Bot API та відкрийте Mini App з Telegram на реальному пристрої.

Перед релізом запускайте:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
