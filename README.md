# TrashSmart

A gamified PWA that rewards users for recycling and composting. Built with React + Vite + vite-plugin-pwa. Classification is wired to a Hugging Face Inference endpoint; points and streaks live in localStorage.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in VITE_HF_URL and VITE_HF_TOKEN
npm run dev
```

Open http://localhost:5173 on your phone (same Wi-Fi) or desktop. To install as a PWA, build first:

```bash
npm run build
npm run preview
```

Then in Chrome/Edge use the install icon in the address bar, or on iOS Safari use Share → Add to Home Screen.

## Connecting your Hugging Face model

The app expects an image-classification endpoint. Set these in `.env.local`:

- `VITE_HF_URL` — full URL of your HF model endpoint
- `VITE_HF_TOKEN` — your HF access token (read scope)

The classifier posts the photo as binary to the endpoint and expects a JSON response in one of these shapes:

```json
[{ "label": "plastic_bottle", "score": 0.92 }, ...]
```

or

```json
{ "label": "plastic_bottle", "score": 0.92 }
```

Labels are mapped to in-app items in `src/lib/catalog.js` (see `LABEL_TO_ITEM`). Add your model's label set there. Unknown labels fall through to the `unknown` item which still awards a small base XP so the experience never dead-ends.

If no env is set, the app uses a mock classifier that returns random items — useful for local UI work without burning API calls.

## Project layout

```
src/
  lib/         classifier (HF), storage, catalog, points math
  state/       useGameState React hook (the single source of truth)
  components/  Ring, BottomNav, badges, chips
  screens/     Onboarding, Home, Scan, ScanResult, Quests, Streak, Rewards
```

## Icons

Drop your own `public/icons/icon-192.png` and `public/icons/icon-512.png` for the installed-PWA icon. A simple `public/favicon.svg` is included.

## What's in v1

Core loop: pick streams → scan an item → get classified + tip → optional verify-photo for bonus XP → progress dual streak rings and dual XP streams (recycle / organic) → daily quests → simple rewards shop. Map, leaderboard, trophy room, and friend duels are in the wireframes but not in v1.
