# Наш будинок

Telegram Mini App для мешканців багатоквартирного будинку. Основна мова інтерфейсу — українська.

## Технології

- Next.js (App Router) + TypeScript у strict-режимі
- Tailwind CSS
- Telegram Mini Apps WebApp API
- Supabase: Postgres, Auth, Storage та Row Level Security

## Локальний запуск

1. Встановіть Node.js 20.9 або новішої версії.
2. Створіть локальний файл змінних оточення:

   ```bash
   cp .env.example .env.local
   ```

3. Заповніть значення Supabase та Telegram. Не додавайте `.env.local` до Git.
4. Встановіть залежності й запустіть застосунок:

   ```bash
   npm install
   npm run dev
   ```

Відкрийте [http://localhost:3000](http://localhost:3000). Для повної перевірки Telegram-інтеграції Mini App має бути доступний через HTTPS і відкритий із Telegram-бота.

## Команди

```bash
npm run lint
npm run typecheck
npm run build
```

## Змінні оточення

Перелік потрібних змінних наведено в [`.env.example`](.env.example). `TELEGRAM_BOT_TOKEN` і ключі з підвищеними правами ніколи не повинні потрапляти до клієнтського коду чи репозиторію.

## Supabase і безпека

1. Створіть Supabase-проєкт і внесіть `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` та серверний `SUPABASE_SERVICE_ROLE_KEY` у `.env.local`.
2. Встановіть [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) і застосуйте схему:

   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   ```

3. Додайте ідентифікатори адміністраторів Telegram у `TELEGRAM_ADMIN_IDS` через кому. Лише серверний bootstrap може встановити `is_admin`; клієнт не має політики для зміни цієї ознаки.

Міграція в [`supabase/migrations`](supabase/migrations) створює таблиці всіх модулів MVP, індекси, приватні image buckets з обмеженнями JPEG/PNG/WebP до 5 МБ і Row Level Security. Адмінські дії захищені серверно перевіреним `is_admin`, а не UI-перевіркою.

### Оновлення зі старої схеми

Якщо у проєкті вже є попередня схема з таблицями `users`, `announcements`, `issues`, `polls` тощо, спершу застосуйте `20260821132000_preserve_legacy_public_schema.sql`, а потім решту файлів у хронологічному порядку. Підготовча міграція лише перейменовує несумісні старі таблиці в `legacy_*`; вона не видаляє дані. Старі записи не переносяться автоматично, оскільки вони прив'язані до Telegram ID, тоді як захищена схема MVP прив'язує авторство до верифікованого UUID користувача Supabase Auth.

`SUPABASE_SERVICE_ROLE_KEY` обходить RLS, тому використовується виключно в серверному маршруті `/api/auth/telegram` і ніколи не має префікса `NEXT_PUBLIC_`.

## Telegram

Клієнт завантажує офіційний Telegram WebApp API, викликає `ready()` і `expand()`, застосовує кольори теми Telegram та реагує на її зміну. Дані `initData` не вважаються довіреними на клієнті: маршрут `/api/auth/telegram` перевіряє HMAC-підпис та `auth_date` з токеном бота, і лише після цього видає одноразовий токен для Supabase-сесії. Зовні Telegram застосунок показує безпечний неавторизований стан.

Практичні кроки для menu button і групової кнопки: [`docs/TELEGRAM.md`](docs/TELEGRAM.md). Інструкція production deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Структура

- `src/app` — маршрути App Router
- `src/components/app` — shell і складові екранів
- `src/components/ui` — повторно використовувані базові UI-компоненти
- `src/components/telegram` — інтеграція Telegram Mini Apps
- `src/lib` — безпечні спільні утиліти
- `supabase` — схема БД, RLS і міграції

Повний склад MVP та межі проєкту визначені у [`docs/MVP.md`](docs/MVP.md).

Детальний статус і план production-реалізації: [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md). Відтворюваний prompt для наступних інженерних ітерацій: [`docs/ENGINEERING_PROMPT.md`](docs/ENGINEERING_PROMPT.md).
