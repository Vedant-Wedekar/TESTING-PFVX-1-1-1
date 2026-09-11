# DropSync

Instant cross-device clipboard and image sharing. Open a room on your laptop,
open the same room on your phone, and anything pasted or dropped on one
appears on the other in real time. No accounts, no sign-in.

## Stack

- React 18 + Vite 5
- Tailwind CSS
- Framer Motion
- Firebase Firestore (realtime data) + Storage (images) + Hosting
- vite-plugin-pwa (installable, offline-cached app shell)

## 1. Firebase project setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Firestore Database** (production mode) and **Storage**.
3. In Project Settings → General → Your apps, add a **Web app** and copy the
   config values.
4. Copy `.env.example` to `.env` and fill in the values:

   ```
   cp .env.example .env
   ```

5. Install the Firebase CLI if you don't have it, and log in:

   ```
   npm install -g firebase-tools
   firebase login
   ```

6. Point the CLI at your project:

   ```
   firebase use --add
   ```

7. Deploy the security rules (see below for what they do):

   ```
   firebase deploy --only firestore:rules,storage:rules
   ```

## 2. Run locally

```
npm install
npm run dev
```

Open the printed local URL. To test cross-device sync, open the same URL on
your phone (same Wi‑Fi network) via your machine's local IP, or deploy first
and use the live URL.

## 3. Build and deploy to Firebase Hosting

```
npm run build
firebase deploy --only hosting
```

`firebase.json` is already configured to serve `dist/` with an SPA rewrite so
client-side routing (`/room/1234`) works on refresh.

## Folder structure

```
src/
  components/    Reusable UI pieces (cards, upload zone, header, modals…)
  pages/         Home.jsx (join screen) and Room.jsx (the clipboard itself)
  lib/           Firebase-facing data access (rooms.js, messages.js, firebase.js)
  hooks/         useOnlineStatus, useUploadQueue (offline queueing)
  context/       ThemeContext (dark mode)
  utils/         hash.js (room passwords + ID gen), localRooms.js (recent
                 rooms, favourites, device id — all localStorage), time.js
firestore.rules  Firestore access rules
storage.rules    Storage access rules
firebase.json    Hosting + rules deployment config
```

## How a room works

- A **room** is just a Firestore document at `rooms/{roomId}` (e.g. `rooms/1234`).
  Typing a room ID and hitting **Join** creates it if it doesn't exist yet, or
  joins it if it does.
- **Messages** (text and images) live in the `rooms/{roomId}/messages`
  subcollection and are streamed to every connected client via a Firestore
  `onSnapshot` listener — that's what makes uploads appear instantly on other
  devices with no refresh.
- **Images** are compressed client-side (via `browser-image-compression`) then
  uploaded to Storage at `room-images/{roomId}/...`; the download URL is
  saved on the message document.
- **Auto-cleanup**: each message can carry an `expiresAt` timestamp (1h / 6h /
  24h / never, chosen from the room's menu). A client-side interval sweeps and
  deletes anything past its expiry while a room is open. Because there's no
  backend cron in this setup, cleanup only runs while at least one client has
  the room open — see "Optional: server-side cleanup" below if you want
  guaranteed deletion of abandoned rooms.
- **Recent rooms, favourites, local nicknames, device id, and theme** are all
  stored in `localStorage` on each device — they're intentionally per-device
  and never synced, so your phone's "recent rooms" list can differ from your
  laptop's.

## Security model — please read

This app has **no authentication system by design** — that's the whole
point of the product. That trade-off has real limits worth knowing before you
put anything sensitive in a room:

- A **room password**, if set, is hashed (SHA-256) client-side and checked
  against the stored hash before joining. This deters casual guessing but is
  **not equivalent to real authentication** — Firestore's rules can't
  cryptographically verify a password without a backend function, so the
  rules mainly enforce document *shape* (field types, sizes, immutability of
  `passwordHash` after creation) rather than gatekeeping reads. Firestore
  rules do allow public **read** access to room documents and messages, since
  the join screen needs to detect whether a room requires a password before
  a user has entered one.
- Treat room IDs (and passwords) like you'd treat a shared Google Doc link:
  anyone who has it can read and write to that room.
- Don't put anything in a room you wouldn't paste into a public URL —
  this is a *convenience* tool for moving your own clipboard between your own
  devices, not a secure storage system.
- If you need real access control, the natural next step is Firebase
  Cloud Functions: move password verification server-side and issue a
  short-lived custom token per successful join, then tighten `firestore.rules`
  to require that token.

## Optional: server-side cleanup

For guaranteed deletion of expired uploads even when no one has the room
open, add a scheduled Cloud Function (Firebase Functions v2 `onSchedule`)
that queries the `messages` collection group where `expiresAt <= now` and
deletes matches plus their Storage objects. This wasn't required for the
core app so it's left out of the default deliverable, but the `expiresAt`
field is already written on every message specifically so this is a drop-in
addition later.

## Known trade-offs / things to harden before heavy production use

- Deleting a room does not cascade-delete its `messages` subcollection or
  Storage files server-side (Firestore doesn't cascade deletes). The client
  currently only deletes the room document itself on "Delete room" — add a
  Cloud Function trigger on room delete if you need guaranteed cleanup of
  subcollections + Storage objects for deleted rooms.
- `navigator.clipboard.write` (image copy) and `navigator.share` degrade
  gracefully but aren't available in every browser — the buttons fall back to
  download/copy-link behavior where possible.
- The offline upload queue lives in memory (`useUploadQueue`), so a hard
  refresh while offline will drop anything still queued — it's meant to
  smooth over brief connectivity blips, not long offline stretches.
