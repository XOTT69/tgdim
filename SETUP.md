# 🚀 Що треба зробити, щоб все запрацювало

## Крок 1. Supabase (база даних)

1. Зайди на https://supabase.com → створи новий проєкт
2. Зайди в **SQL Editor** (ліве меню)
3. Скопіюй ВЕСЬ вміст файлу `supabase/schema.sql` → вставь → натисни **Run**
4. Зайди в **Storage** (ліве меню) → створи бакет з назвою `issue-photos` → постав галочку **Public**
5. Зайди в **Settings → API** і скопіюй:
   - `Project URL` → це `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → це `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - `service_role` key → це `SUPABASE_SERVICE_ROLE_KEY`

---

## Крок 2. Telegram Bot

1. Відкрий у Telegram: @BotFather
2. Напиши `/newbot` → дай назву → отримай **токен** (довгий рядок з цифрами і буквами)
3. Це твій `TELEGRAM_BOT_TOKEN`
4. Щоб дізнатись свій Telegram ID — напиши боту @userinfobot, він покаже число — це `ADMIN_TELEGRAM_IDS`
5. Можна вказати кілька адмінів через кому: `123456789,987654321`

---

## Крок 3. Заповни .env.local

Відкрий файл `.env.local` і заміни placeholder на реальні значення:

```
NEXT_PUBLIC_SUPABASE_URL=https://ТВІЙ-ПРОЄКТ.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...твій-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhb...твій-service-role-key
TELEGRAM_BOT_TOKEN=1234567890:ABCdef...твій-токен
ADMIN_TELEGRAM_IDS=твій-telegram-id
```

---

## Крок 4. Деплой на Vercel

1. Залий код на GitHub
2. Зайди на https://vercel.com → **New Project** → підключи свій репозиторій
3. В налаштуваннях проєкту на Vercel зайди в **Settings → Environment Variables**
4. Додай ВСІ 5 змінних з `.env.local` (такі ж назви і значення)
5. Натисни **Deploy**
6. Після деплою скопіюй URL (наприклад `https://tgdim.vercel.app`)

---

## Крок 5. Підключи Mini App до Telegram

1. Відкрий @BotFather → обери свого бота
2. Напиши `/setmenubutton`
3. Вкажи URL свого задеплоєного сайту: `https://tgdim.vercel.app`
4. Тепер коли хтось відкриє бота — буде кнопка "Menu" яка відкриє Mini App

---

## 📋 Де що лежить (для розуміння)

| Що | Де |
|----|-----|
| Змінні середовища | `.env.local` (локально) або Vercel Settings (продакшн) |
| SQL схема бази | `supabase/schema.sql` — виконати 1 раз в Supabase SQL Editor |
| API бекенд | `src/app/api/` — кожна папка = один endpoint |
| Сторінки | `src/app/` — кожна папка = один URL |
| Компоненти | `src/components/` |
| Telegram авторизація | `src/lib/telegram-auth.ts` |
| Supabase клієнти | `src/lib/supabase-server.ts` (бекенд), `src/lib/supabase-browser.ts` (фронт) |
| Хук Telegram | `src/lib/use-telegram.ts` |

---

## ⚠️ Важливо

- **НЕ коміть** `.env.local` в git (він вже в `.gitignore`)
- Якщо додаєш нових адмінів — міняй `ADMIN_TELEGRAM_IDS` в env
- Storage bucket `issue-photos` має бути **public** щоб фото відображались
- Mini App працює ТІЛЬКИ з Telegram (поза Telegram авторизація не пройде)
