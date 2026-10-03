# AgroVani — Voice Farm Assistant

AgroVani is a voice-first agricultural assistant for farmers in **Solapur district, Maharashtra**. The interface is primarily **Marathi** (including Solapur / Mayboli dialect phrases), with large tap targets and spoken confirmation so it remains usable for semi-literate users.

The app is a **Progressive Web App (PWA)** wrapped in a mobile phone frame: farmers can install it on Android, speak in Marathi, and get crop, weather, mandi, scheme, and disease-diagnosis help without needing to read long English screens.

---

## What problem it solves

Rural farmers often need:

- Today’s **weather and spray/irrigation advice** for their taluka
- **Mandi rates** and which nearby APMC pays more after transport
- **Crop practices** for Solapur staples (jowar, onion, pomegranate, sugarcane, tur, cotton, and others)
- **Disease diagnosis** from a leaf photo or spoken symptoms
- **Government scheme** eligibility in simple Marathi
- A private **farm profile**, expense book, soil card, and daily crop calendar

AgroVani gathers those modules in one Marathi voice-and-tap app, with offline-aware caching for patchy rural networks.

---

## Who it is for

| Audience | Why they would open this repo |
| --- | --- |
| New developers | Understand the stack, folders, APIs, and how to run locally |
| Designers / testers | Know screens, demo login, microphone/camera needs |
| Domain reviewers | See which data is live vs demo, and the Solapur scope |

**Geographic scope:** 11 Solapur talukas — उत्तर सोलापूर, दक्षिण सोलापूर, पंढरपूर, बार्शी, सांगोला, करमाळा, माढा, माळशिरस, मंगळवेढा, मोहोळ, अक्कलकोट.

---

## Features

### Voice assistant (two-way confirmation)

- Speak in Marathi (`mr-IN` browser speech recognition).
- A local **NLP engine** maps dialect phrases to an intent (crop info, weather, mandi, schemes, Krushi Doctor, my farm, calendar, finance, soil, mandi comparison).
- The app **asks a confirmation question** before navigating, so a misheard query is not acted on silently.
- Spoken replies use **Gemini TTS** (Marathi farmer-style pronunciation) with a Web Speech API fallback.
- Voice gender: **Kore** or **Puck**.

Example spoken queries:

- `आजचे हवामान काय आहे` → Weather
- `कांदा भाव किती` → Mandi prices
- `तेल्या रोग` / leaf photo → Krushi Doctor
- `हिशोब` / `नफा तोटा` → Farm finance
- `कुठे जास्त भाव` → Mandi comparison

### Home dashboard

- Greeting with farmer name, taluka selector, live ticker
- Module cards, PWA install button, offline/sync badge
- Early weather/pest **hazard alerts** for the selected taluka
- Shield control for **sensitive farmer data** (Aadhaar / 7-12 / DBT — masked)

### Modules

| Screen | What it does |
| --- | --- |
| **पीक माहिती (Crop info)** | Local crop cards: soil, season, water, yield, practices, audio |
| **हवामान (Weather)** | Live taluka weather from Open-Meteo, 3-day forecast, farm advisory in Marathi |
| **मंडी भाव (Mandi prices)** | Solapur APMC-style rates, arrivals, trends, audio readouts |
| **बाजार तुलना (Mandi comparison)** | Compare APMCs (e.g. Solapur, Pandharpur, Barshi) after transport and cess; net realization; price alerts |
| **शासकीय योजना (Schemes)** | Subsidy, eligibility, documents, portal, deadline, audio summary |
| **कृषी डॉक्टर (Krushi Doctor)** | Gemini vision + text diagnosis; chemical dosage per 15 L pump; biological remedies; Marathi chat; printable health report |
| **माझी शेती (My farm)** | Logged-in farm profile, crop stages, diagnosis history |
| **पीक दिनदर्शिका (Crop calendar)** | Stage-based daily tasks (irrigation, fertilizer, spray, harvest) |
| **जमा-खर्च (Farm finance)** | Income/expense ledger, crop-wise profit, voice-noted transactions |
| **माती परीक्षण (Soil health)** | Digital soil health card (pH, OC, NPK, EC, lime) and fertilizer prescription |
| **लॉगिन / नोंदणी (Auth)** | Mobile + 4-digit PIN (demo OTP path). Profile stored in the browser |

### Offline, PWA, and privacy

- **vite-plugin-pwa** with standalone portrait install, auto-updating service worker, font caching
- Pending actions queued in `localStorage` and synced when back online
- Farmer profile, PIN hash, soil card, transactions, and alerts stay **on-device**
- Sensitive fields are **masked** in the UI; PIN lock (demo default PIN is `1234` if none is set)

---

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS 4, Lucide icons, Motion |
| Bundler | Vite 8 |
| App server | Express 4 + `tsx` (serves API + Vite middleware in development) |
| AI | Google Gemini (`@google/genai`) — TTS, leaf diagnosis, doctor chat |
| Weather | [Open-Meteo](https://open-meteo.com/) (no API key) |
| Speech in | Browser `SpeechRecognition` / `webkitSpeechRecognition`, language `mr-IN` |
| PWA | `vite-plugin-pwa` (Workbox) |

---

## Architecture

```
Browser (React SPA, Marathi UI)
  ├── NLP (src/services/nlpEngine.ts) — dialect → intent
  ├── Speech (speechService.ts) — mic + /api/tts + Web Speech fallback
  ├── Local data (agriculturalData.ts, cropCalendarData.ts)
  └── localStorage — profile, PIN, finance, soil, sync queue
        │
        │  POST /api/tts
        │  GET  /api/weather?taluka=...
        │  GET  /api/mandi
        │  POST /api/diagnose
        │  POST /api/krushi-doctor/chat
        ▼
Express (server.ts) ── Gemini ── Open-Meteo
```

In **development**, `npm run dev` starts Express on **port 3000** and mounts Vite in middleware mode (you use `http://localhost:3000`, not the Vite-only 5173 port from `vite.config.ts`).

In **production**, build the SPA with Vite, then run the same Express process with `NODE_ENV=production` so it serves `dist/` plus the API routes.

### Backend routes

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/tts` | Body: `{ text, voiceName? }`. Returns WAV as base64. In-memory cache (~150 entries). Needs `GEMINI_API_KEY`. |
| `GET` | `/api/weather` | Query: `taluka` (Marathi name). Live Open-Meteo + Marathi advisory. |
| `GET` | `/api/mandi` | Demo/static Solapur APMC basket with today’s date stamp (not a live Agmarknet scrape). |
| `POST` | `/api/diagnose` | Body: `{ symptomText, imageBase64?, crop }`. Gemini JSON diagnosis. |
| `POST` | `/api/krushi-doctor/chat` | Body: `{ message, history?, currentCrop, currentDiagnosis? }`. |

If `/api/weather` is unreachable, the client can fall back to Open-Meteo directly, then to bundled taluka weather samples.

---

## Project structure

```
AgroVani_Assistant/
├── server.ts                 # Express + Gemini + weather/mandi/diagnose/chat
├── vite.config.ts            # React, Tailwind, PWA manifest
├── index.html
├── metadata.json             # Product name, camera/mic, Gemini capability
├── .env.example
├── scripts/generate-icons.js # Optional PWA PNG generator
├── public/                   # Icons (icon.svg, PWA PNGs)
└── src/
    ├── App.tsx               # Screen router (splash → modules)
    ├── main.tsx
    ├── index.css
    ├── types/index.ts
    ├── data/                 # Crops, schemes, diseases, calendar
    ├── hooks/usePWAInstall.ts
    ├── services/             # NLP, speech, security, offline, APIs, finance, soil…
    └── components/
        ├── AndroidFrame.tsx
        ├── VoiceAssistantModal.tsx
        ├── modules/          # One file per farmer-facing screen
        └── …
```

---

## Prerequisites

- **Node.js** 20+ recommended (ES modules, `tsx`)
- A **Gemini API key** for TTS, diagnosis, and doctor chat  
  Get one from [Google AI Studio](https://aistudio.google.com/apikey)
- A Chromium-based browser with **microphone** (and **camera** for leaf photos)
- HTTPS or `localhost` — required for mic, camera, and PWA install

---

## Getting started

```bash
git clone <this-repo-url>
cd AgroVani_Assistant
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
PORT=3000
```

`APP_URL` is optional for local work (used when the app is hosted, e.g. Cloud Run). `PORT` defaults to `3000`.

Start the full-stack app:

```bash
npm run dev
```

Open **http://localhost:3000**. You should see the splash screen, then the home dashboard.

Allow **microphone** when the voice modal opens. Allow **camera** (or pick a photo) in Krushi Doctor.

### Other scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Express + Vite middleware (local development) |
| `npm run build` | Production SPA into `dist/` |
| `npm run start` | Same entry as `dev` (`tsx server.ts`); use `NODE_ENV=production` after a build to serve `dist/` |
| `npm run preview` | Vite preview of the built SPA only (API routes will not run unless Express is up) |
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm run clean` | Remove `dist` (Unix `rm`; on Windows use `Remove-Item -Recurse -Force dist`) |

---

## Demo account (local)

The app ships with a **sample Solapur farmer** in `localStorage` so you can explore without registering:

- Name: तुकाराम विठोबा शिंदे  
- Village / taluka: कोर्टी, पंढरपूर  
- Crops: ज्वारी, ऊस, डाळिंब  
- PIN: **`1234`** if you have not set another PIN  

You can register a new profile under Auth; data stays in this browser only.

---

## Data: live vs demo

| Source | Live? | Detail |
| --- | --- | --- |
| Weather | Yes | Open-Meteo for taluka lat/lon; advisory text generated on the server |
| Gemini TTS / diagnose / chat | Yes, if key is set | Fails with 500 if `GEMINI_API_KEY` is missing or invalid |
| Mandi `/api/mandi` | Demo | Representative Solapur APMC prices, not a live government feed |
| Mandi comparison | Demo | Bundled multi-mandi table + local price alerts |
| Crops, schemes, calendar, hazards | Bundled | `src/data/` and hazard service |
| Soil card & finance | Demo + local edits | Defaults, then `localStorage` |

Treat chemical dosages from Krushi Doctor as **decision support**, not a substitute for a local agri officer or label instructions.

---

## Browser and device notes

- Best on **Chrome / Edge** (Android or desktop with the in-app phone frame).
- Speech recognition is strongest in Chrome with `mr-IN`.
- Install as PWA from the home dashboard when the browser offers it.
- Pop-ups must be allowed to print/download the crop health report.

---

## Environment and secrets

Never commit `.env`. `.gitignore` ignores `.env*` except `.env.example`.

| Variable | Required | Use |
| --- | --- | --- |
| `GEMINI_API_KEY` | For AI features | TTS, vision diagnosis, doctor chat |
| `APP_URL` | Hosting | Public URL of the deployment |
| `PORT` | No | Server port (default `3000`) |
| `NODE_ENV` | Production | `production` serves `dist/` instead of Vite middleware |

---

## Extending the project

- **New voice phrases:** add dialect keywords in `src/services/nlpEngine.ts`.
- **New crop / scheme content:** `src/data/agriculturalData.ts` and `cropCalendarData.ts`.
- **New screen:** add a module under `src/components/modules/`, wire it in `App.tsx` and `HomeDashboard.tsx`, and map an NLP intent.
- **Live mandi:** replace the static list in `server.ts` (`GET /api/mandi`) with an official APMC/Agmarknet client.

---

## License

No license file is included in this repository. If you fork or publish, add an explicit license so others know how they may use the code and bundled farm data.
