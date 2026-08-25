# Підключення Telegram Mini App

1. Задеплойте застосунок на HTTPS-домен (наприклад, Vercel).
2. У BotFather створіть або відкрийте бота, установіть домен Mini App і menu button з URL застосунку.
3. Додайте `TELEGRAM_BOT_TOKEN` тільки до змінних оточення хостингу.
4. У `TELEGRAM_ADMIN_IDS` укажіть числові Telegram ID адміністраторів через кому.

Для menu button можна використати Bot API (токен підставляється лише у вашому shell):

```bash
curl --request POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setChatMenuButton" \
  --header "Content-Type: application/json" \
  --data '{"menu_button":{"type":"web_app","text":"Наш будинок","web_app":{"url":"https://your-domain.example"}}}'
```

Для кнопки в груповому повідомленні використовуйте `web_app` у `InlineKeyboardButton` з тим самим HTTPS URL. Mini App надсилає `initData` до `/api/auth/telegram`; сервер перевіряє HMAC і давність даних, тому не замінюйте цей маршрут клієнтською перевіркою.
