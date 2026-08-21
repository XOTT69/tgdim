# tgdim MVP

## Resident app

### Home
- Important announcements
- Open building issues
- Active polls
- Upcoming events

### Issues
Categories:
- 💡 Lighting
- 🚰 Water
- 🗑 Waste
- 🧹 Cleaning
- 🚪 Doors / intercom
- 🅿️ Parking / territory
- 🌳 Yard / common area
- ❓ Other

Fields: category, entrance/floor/location, description, photo.
Statuses: 🟡 New, 🔵 In progress, 🟢 Resolved.

### Announcements
Admin-created building-wide posts with optional image, publication time and optional expiration.

### Polls
Question + options + optional closing time. One vote per Telegram user. Support single-choice first; multi-choice can follow.

### Found / Lost
Posts for keys, documents and other lost/found property. Fields: type, title, description, location, date, photo, contact method. No parcel functionality.

### Masters
Categories such as plumber, electrician, appliance repair, cleaning and other services. Residents can add a recommendation and optionally a contact. Show recommendation count and average rating.

### Help
Two post types: `Потрібна допомога` and `Можу допомогти`. Include title, description, location and optional contact details.

### Events
Title, description, date/time, location and organizer. Residents can mark participation.

### Profile
Telegram avatar/name, optional entrance/apartment, notification preferences.

## Admin
Admin dashboard for announcements, issues, polls, moderation of community posts, masters and events.

## Navigation
Recommended mobile navigation:
- 🏠 Головна
- 🔧 Проблеми
- 📢 Оголошення
- 🗳 Голосування
- 👤 Профіль

Secondary modules are accessible from Home/More.

## Telegram integration
The bot should expose the Mini App through a menu button and/or a group message button. The Mini App receives Telegram WebApp `initData`; backend verifies it before creating/reading the user session.

## Future ideas
- Building document library
- Emergency notices
- Anonymous issue reporting
- Push notifications via Telegram bot
- Building map / entrance information
- Integration with blackout information from the existing bot
