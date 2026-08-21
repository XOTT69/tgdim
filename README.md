# Наш будинок

Mobile-first Telegram Mini App for apartment-building residents. The UI is Ukrainian and works as a useful preview in a normal browser; protected writes require a verified Telegram Web App session.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. Configure Supabase before testing real data: run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor and create the `issue-photos` storage bucket.

## Security and production setup

1. Set `TELEGRAM_BOT_TOKEN` only in your hosting environment. It validates `initData` on every protected request; never expose it to the browser.
2. Set `SUPABASE_SERVICE_ROLE_KEY` only on the server. Keep Row Level Security enabled and do not create anonymous write policies.
3. Set `ADMIN_TELEGRAM_IDS` to a comma-separated allowlist. Announcement creation and issue status changes are checked on the server.
4. Point the BotFather menu button or a `web_app` button to the deployed HTTPS URL.

Issue-photo uploads accept JPEG, PNG, and WebP files up to 5 MB.
