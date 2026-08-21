# tgdim — Наш будинок

Telegram Mini App для мешканців будинку. Відкривається з Telegram-бота або групи.

## Модулі MVP

- 🏠 **Головна** — оголошення, проблеми, швидкі посилання
- 🔧 **Проблеми** — звіти про проблеми будинку з категоріями та статусами
- 📢 **Оголошення** — адмін CRUD для оголошень
- 🗳 **Голосування** — опитування з одиничним/множинним вибором
- 🔑 **Знахідки / Втрати** — оголошення про знайдені/загублені речі
- 🛠 **Майстри** — рекомендації перевірених спеціалістів
- 🤝 **Допомога** — запити та пропозиції допомоги
- 📅 **Події** — зустрічі, прибирання та інші заходи
- 👤 **Профіль** — Telegram-ідентифікація, під'їзд/квартира

## Стек

- Next.js 14 + TypeScript
- Tailwind CSS
- Supabase (Postgres + Storage)
- Telegram Mini Apps SDK
- Vercel (деплой)

## Запуск

```bash
# 1. Встановити залежності
npm install

# 2. Скопіювати env
cp .env.example .env.local
# Заповнити реальними значеннями

# 3. Запустити dev server
npm run dev
```

## Налаштування Supabase

1. Створіть проєкт на [supabase.com](https://supabase.com)
2. Виконайте SQL з `supabase/schema.sql` в SQL Editor
3. Створіть Storage bucket `issue-photos` (public)
4. Скопіюйте URL, anon key і service role key в `.env.local`

## Telegram Bot

1. Створіть бота через [@BotFather](https://t.me/BotFather)
2. Налаштуйте Menu Button → ваш URL (наприклад `https://your-app.vercel.app`)
3. Скопіюйте токен бота в `TELEGRAM_BOT_TOKEN`
4. Додайте Telegram ID адмінів в `ADMIN_TELEGRAM_IDS`

## Структура проєкту

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── api/          # Backend API (issues, announcements, polls, etc.)
│   ├── issues/       # Issues module pages
│   ├── announcements/ # Announcements page
│   ├── polls/        # Polls page
│   ├── found-lost/   # Found/Lost page
│   ├── masters/      # Masters page
│   ├── help/         # Help page
│   ├── events/       # Events page
│   └── profile/      # Profile page
├── components/       # Shared UI components
└── lib/              # Utils, types, Supabase clients, Telegram auth
supabase/
└── schema.sql        # Database schema + RLS + functions
```

## Безпека

- Telegram initData перевіряється server-side
- Supabase service_role key тільки на сервері
- RLS увімкнено для всіх таблиць
- Завантаження обмежене 5MB, лише JPEG/PNG/WEBP
- Адмін-дії захищені allowlist по Telegram ID
