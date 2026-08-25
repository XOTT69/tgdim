# План реалізації production MVP

## Контекст і рішення

GitHub-версія від 25 серпня 2026 року має повний перелік маршрутів, але її серверні API використовують `service_role`, а RLS-політики дозволяють усі операції. Це означає, що захист не працює. Робоча гілка перебудовує застосунок на схемі з приватним Storage, RLS та короткоживучою Supabase-сесією, виданою лише після серверної перевірки Telegram `initData`.

Обидва попередні стани збережено в Git:

- `origin/main` — стан на GitHub перед перебудовою;
- `codex/local-mvp-backup` — попередня локальна production-реалізація.

## Етапи

1. **Foundation** — Next.js App Router, strict TypeScript, Tailwind, Telegram theme, mobile shell, safe environment variables.
2. **Identity and access** — перевірка HMAC та `auth_date` на сервері, bootstrap Supabase-сесії, ролі тільки через server-side allowlist.
3. **Data and storage** — міграції Postgres, індекси, RLS, приватні image buckets, MIME/size limits, RPC для чутливих операцій.
4. **Resident flows** — Home, announcements, issues, polls, found/lost, masters, help, events, profile: усі з loading/error/empty states.
5. **Admin flows** — announcement CRUD, issue status, poll lifecycle, master/event creation, moderation community content.
6. **Quality** — unit tests Telegram auth, lint, typecheck, production build, mobile visual QA.
7. **Release** — Supabase migration, Vercel environment variables, BotFather menu button/group button, verification on a real Telegram device.

## Definition of done

- Жодного секрету в Git або `NEXT_PUBLIC_*` для server-only values.
- Кожна дія з даними захищена RLS або server-side verification; UI не є бар’єром доступу.
- Фото дозволяють лише JPEG/PNG/WebP до 5 МБ та не є публічними.
- Усі модулі MVP з `docs/MVP.md` доступні з мобільного інтерфейсу українською.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` проходять.
- Реальні Supabase і Telegram credentials підключені тільки в deployment environment.

## Зовнішні кроки, які потребують доступу власника

Для фактичного запуску потрібні значення з `.env.example` та доступ до Supabase-проєкту: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_IDS`. Після їх отримання застосовується `supabase db push`, а HTTPS URL додається до BotFather/Vercel.
