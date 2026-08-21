# tgdim — Telegram Mini App for apartment building residents

## Goal
Build a Telegram Mini App called `Наш будинок` for residents of one apartment building. It is opened from the Telegram bot/group and uses Telegram Web Apps authentication. The existing electricity/blackout bot remains a separate feature and is not part of this MVP.

## MVP modules
1. Home — important announcements, active issues, active polls, upcoming events.
2. Issues — residents can report a building problem with category, location, description and optional photo. Admin can change status: new, in progress, resolved.
3. Announcements — building-wide notices. Admin CRUD.
4. Polls — single/multiple-choice polls, one vote per Telegram user, results after voting/closing.
5. Found / Lost — found items, keys, documents and other lost-property posts. No parcel module.
6. Masters — recommendations for trusted local repair/service providers, with category and resident rating/recommendation count.
7. Help — residents can post requests for help and offers of help.
8. Events — building meetings, cleanups and other events with date/time/location.
9. Profile — Telegram identity, optional apartment/entrance fields, notification preferences.

## Explicitly excluded from MVP
- elevators
- sensors / IoT
- pets / animals
- parcel tracking
- payments
- native mobile apps
- complicated HOA/accounting integrations

## Recommended stack
- Next.js + TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth/data layer, Storage for images)
- Telegram Mini Apps SDK / WebApp API
- Vercel deployment

## UX
Mobile-first. Ukrainian language. Clean modern Telegram-like interface. Use large touch targets, cards, bottom navigation and Telegram theme variables where possible. Avoid unnecessary complexity.

## Security
- Never commit Telegram bot tokens, Supabase service-role keys, or other secrets.
- Validate Telegram init data server-side before trusting user identity.
- Use Supabase Row Level Security.
- Admin actions must be protected by an allowlist/role, not by client-side checks.
- Uploaded images must be constrained by size/type.

## Development order
1. Scaffold app and Telegram Mini App shell.
2. Implement Telegram user bootstrap/auth verification.
3. Create Supabase schema + RLS.
4. Implement Home + Announcements.
5. Implement Issues + admin status flow.
6. Implement Polls.
7. Implement Found/Lost, Masters, Help and Events.
8. Add admin area.
9. Add Telegram bot deep-link/menu-button integration instructions.
10. Add deployment documentation and tests.

## Quality bar
- TypeScript strict mode.
- No hardcoded secrets.
- Responsive on typical Telegram mobile viewport.
- Loading, empty and error states for every data-driven screen.
- Accessible buttons/forms and clear Ukrainian labels.
- Keep components modular and avoid a monolithic page.
