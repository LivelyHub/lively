<h1 align="center">Lively</h1>

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Backend](https://img.shields.io/badge/backend-Fastify%205-black)
![Mobile](https://img.shields.io/badge/mobile-Expo-000020)
![Bot](https://img.shields.io/badge/bot-Telegram%20%2B%20WhatsApp-25D366)
![Hackathon](https://img.shields.io/badge/Garuda%20Hacks%207.0-Health%20track-orange)

**A WhatsApp/Telegram companion that keeps elderly parents active and their family in the loop.**

Lively pairs an elderly person ("Eyang") with a friendly AI companion (Mbak Asih / Mas Budi) that texts daily check-ins, tracks a simple chair-stand fitness test, medication adherence, and exercise streaks — then reports a plain-language progress summary to the adult child through a companion mobile app. The elder never sees scores, streaks, or gamification UI; that layer exists only for the family member watching from the mobile app.

Built for **Garuda Hacks 7.0** (Health track).

> This is a monorepo — one clone gets all four services (`backend`, `bot`, `mobile`, `landing`), merged in via `git subtree` from their original repos ([backend](https://github.com/LivelyHub/lively-backend) · [bot](https://github.com/LivelyHub/lively-bot) · [mobile](https://github.com/LivelyHub/lively-mobile) · [landing](https://github.com/LivelyHub/lively-landing)).

---

## Table of Contents

- [Demo](#demo)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Gamification](#gamification)
- [Testing](#testing)
- [Performance Targets](#performance-targets)
- [License](#license)

---

## Demo

*(tbd — add demo video/link here)*

## Screenshots

*(tbd — add screenshots from mobile app + landing page here)*

---

## Features

### Core

- **AI companion chat** (`bot`) — persona-driven daily check-ins over Telegram (implemented) and WhatsApp (optional, via Baileys), with human-like pacing: replies split into ≤3 message bubbles, typing delay computed from message length (40 chars/sec, capped 2–8s).
- **Elder & family accounts** (`backend`) — JWT-authenticated family members own one or more elder profiles.
- **Chair-stand assessment** — 30-second chair-stand test results logged and scored as a fall-risk/fitness proxy.
- **Medication tracking** — medication list + per-dose logging, rolled up into an adherence score.
- **Exercise streaks** — daily exercise check-ins tracked as a consecutive-day streak.
- **Family progress dashboard** (`mobile`) — read-only chat monitor, progress charts, and a weekly/monthly report screen for the family member — never shown to the elder.
- **Marketing site** (`landing`) — single-scroll pitch page: problem, how-it-works, companion preview, judges/CTA.

### Bonus / planned (not yet implemented)

- Alerts (missed day, medication missed, pain/dizziness mention, no-response, emergency) with push notifications.
- "Titipan" — family-to-elder message relay through the companion.
- Bot ↔ backend integration (bot currently runs standalone; wiring to `BOT_SERVICE_KEY` + backend API is speculative in the bot repo).
- Official WhatsApp Cloud API channel (current bot uses the unofficial Baileys library; Meta Cloud API was the original spec).

---

## Tech Stack

| Component | Status | Stack |
|---|---|---|
| `backend` | routes implemented, no tests wired | TypeScript (ESM) · Fastify 5 · Drizzle ORM · PostgreSQL 16 (Neon) · Zod · bcryptjs · `@fastify/jwt` |
| `bot` | Telegram channel working, WhatsApp optional | TypeScript · grammy (Telegram) · Baileys (WhatsApp, unofficial) · OpenAI SDK (OpenAI + OpenRouter fallback) · pino |
| `mobile` | docs/spec only, no code yet | Planned: Expo + TypeScript · expo-router · TanStack Query · NativeWind + react-native-reusables |
| `landing` | scaffolded, static | Vite · React 19 · TypeScript · React Compiler (Tailwind/shadcn intended, not yet wired) |

All four repos are MIT-licensed and share a common contract doc (`CORE.md`) copied across them.

---

## Getting Started

```bash
git clone https://github.com/LivelyHub/lively.git
```

Everything is in one clone. Set up each component individually — see its own README for details:

**backend**
```bash
cd backend
npm install
cp .env.example .env   # DATABASE_URL, BOT_SERVICE_KEY, JWT_SECRET, PORT
docker compose up db   # local Postgres on :5433
npm run db:generate && npm run db:migrate
npm run dev
```

**bot**
```bash
cd bot
npm install
cp .env.example .env   # TELEGRAM_BOT_TOKEN, OPENAI_API_KEY / OPENROUTER_API_KEY, WHATSAPP_ENABLED
npm run dev
```

**mobile** — not yet runnable; see `mobile/PLAN.md`. Planned: `npx create-expo-app`, `BACKEND_API_URL` env var.

**landing**
```bash
cd landing/lively-landing
npm install
npm run dev
```

---

## Architecture

```
mobile (Expo, planned)  ──REST/JWT──▶  backend (Fastify) ──▶ PostgreSQL (Neon)
                                             ▲
bot (Telegram + WhatsApp) ──service key──────┘   (planned; not wired yet)

landing (Vite/React) — static, no backend calls
```

- **backend** is the shared brain: neither `mobile` nor `bot` talk to the database directly.
- Two auth modes on the backend: family-member JWT (mobile) and a static `BOT_SERVICE_KEY` header (bot, service-to-service) — the bot-side call is still a stub.
- **bot** currently owns its own in-memory conversation history and calls the LLM directly; persisting conversations to `backend` is planned, not implemented.
- **landing** is fully static — no auth, no backend calls, no CMS.

---

## Data Flow

1. Elder receives a scheduled or reactive message from the companion (Telegram now, WhatsApp optional) — `bot`.
2. Bot builds a reply using the LLM (OpenAI, OpenRouter fallback), paced to feel human, and (planned) logs the exchange to `backend` via `BOT_SERVICE_KEY`.
3. Elder reports a chair-stand test, exercise, or medication dose — logged as a structured event.
4. `backend` computes derived signals at read time (no extra tables): chair-test score, exercise-streak score, medication-adherence score → averaged into `overall_progress_pct`.
5. Family member opens the `mobile` app (JWT-authenticated) to read the chat monitor, progress charts, and weekly/monthly report — pulled from `backend`.
6. (Planned) `backend` pushes alerts to `mobile` for missed days, missed medication, concerning messages, or no-response.

---

## Gamification

Progress mechanics exist **only for the family member's view** — the elder never sees a score, streak, or badge.

- `overall_progress_pct` = average of three sub-scores:
  - **Chair-test score** = `latest_reps / 15 * 100`
  - **Exercise score** = `current_streak_days / 7 * 100`
  - **Medication score** = `last_7d_taken / last_7d_scheduled * 100`
- `engagement_streak_days` — consecutive days the elder engaged with the companion.
- Chart-ready history for chair tests, exercise, and medication adherence, plus a `GET /elders/:id/report?period=week|month` summary endpoint.
- Explicit product rule (`mobile/docs/UI-UX-GUIDELINES.md`): no leaderboards, no badges, no "beat yesterday" framing toward the elder — the app frames this as a warm status readout for the family, not a game for the elder.

---

## Testing

| Component | Current state |
|---|---|
| `backend` | No tests wired yet (`npm test` is a placeholder). `docs/TESTING.md` specifies a planned Vitest + Fastify `app.inject()` suite per route, against a local Docker Postgres. |
| `bot` | No tests, no CI. |
| `mobile` | No code yet; `docs/TESTING.md` specifies a manual per-screen QA checklist (skeleton/empty/error/offline/live states) run on physical devices via Expo Go, plus a scripted demo-day rehearsal. |
| `landing` | No tests, no CI. |

None of the four repos have CI configured (`.github/workflows` absent everywhere) as of this writing.

---

## Performance Targets

- API endpoints: **<500ms** warm response (`backend`).
- Alert delivery: **<10s** from triggering event to push (`backend`, `mobile`).
- Mobile cold start: **<3s** to first screen.
- Mobile chat live update: **≤10s**.
- No loading spinner visible for **>~2s** in the demo path; no fetch left un-timed-out past 10s.
- Screens must remain usable at **130% OS font scaling**.
- Bot typing delay: computed at 40 chars/sec, capped between 2–8s, to feel human rather than instant.

Scoped out for this hackathon build (see `backend/SPEC.md`): rate limiting, abuse protection, multi-region replication — single Neon instance, trusted two-client system.

---

## License

Each component (`backend`, `bot`, `mobile`, `landing`) and this umbrella repo are licensed under [MIT](LICENSE), © 2026 Lively.

---

<div align="center">

Built for Garuda Hacks 7.0 · Health track

</div>
