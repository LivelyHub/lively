# lively-backend — Testing Guide

> How every backend story is verified. Automated where it's cheap (the API surface), plus the operator curl script that stands in for `lively-bot` during integration and the live demo. Mobile-side testing lives in `lively-mobile/docs/TESTING.md`.

## 1. Automated endpoint tests

**Stack:** vitest + Fastify `app.inject()` (no network, fast) — or supertest if you prefer HTTP. Tests run against local Docker Postgres (`docker compose up db`), migrated + seeded fresh per suite via a global setup that truncates and re-seeds.

```
tests/
  setup.ts              # migrate + truncate + seed before suite
  auth.test.ts          # B2 — register/login + full auth matrix
  elders.test.ts        # B3 — CRUD + ownership
  conversation.test.ts  # B4 — inbound context, outbound splits, pagination
  progress.test.ts      # B5 — chair test, exercise idempotency, aggregate
  medications.test.ts   # B6 — CRUD, dose logging, missed-dose alert
  alerts.test.ts        # B7 — 6 types, dedup, resolve, fan-out query
  titipan.test.ts       # B8 — send, queue, delivered
```

**Per-endpoint minimum (every route gets all four):**
1. Happy path → expected status + response shape
2. Validation failure → 400 with `fields` detail
3. Auth failure → 401 (matrix below)
4. Ownership/not-found → 404 for other-family or nonexistent resources

**Behavioral tests worth their cost (straight from acceptance criteria):**
- B4.3: `before` pages without overlap/gap; `after` returns only newer rows
- B5.2 / B6.2: double-post same day/slot → single row
- B7.1: same elder + type within 30 min → no second alert
- B6.3: 2 missed slots → exactly one `medication_missed`; 1 missed → none
- B4.1: paused elder → message still logged, `paused:true` in response

**Run:** `npm test`. A green suite is the merge bar for every backend story — no story's BACKLOG.md boxes get ticked on red.

## 2. The auth matrix

Every route × four credential columns. Automate as a table-driven test in `auth.test.ts`:

| Route | No auth | Bad token/key | JWT (family) | BOT_SERVICE_KEY |
|---|---|---|---|---|
| `POST /auth/register`, `/auth/login` | 200/201 | n/a | n/a | n/a |
| `POST /elders`, `PATCH /elders/:id`, `GET /elders(/:id)` | 401 | 401 | ✅ own only, else 404 | 401 |
| `GET /elders/:id/conversation`, `/progress`, `/medications` | 401 | 401 | ✅ own | 401 |
| `POST /elders/:id/titipan` | 401 | 401 | ✅ own | 401 |
| `POST /medications`, `PATCH /medications/:id` | 401 | 401 | ✅ own | 401 |
| `GET /alerts`, `PATCH /alerts/:id/resolve` | 401 | 401 | ✅ own | 401 |
| `PATCH /family-members/me` | 401 | 401 | ✅ self | 401 |
| `POST /bot/inbound`, `/bot/outbound` | 401 | 401 | 401 | ✅ |
| `POST /assessments/chair-test`, `/exercise-logs`, `/medication-logs`, `/alerts` | 401 | 401 | 401 | ✅ |
| `GET /bot/titipan-queue`, `PATCH /bot/titipan/:id/delivered` | 401 | 401 | 401 | ✅ |
| `GET /health` | ✅ | ✅ | ✅ | ✅ |

The JWT "own only" cell is the important half: family A's token against family B's elder id must 404 on **every** row.

## 3. Operator curl script (stands in for lively-bot)

Keep these in `scripts/demo.sh`. They drive the bot-facing endpoints so mobile can be tested and the demo can run even if `lively-bot` isn't ready.

```bash
BASE=http://localhost:3000   # or the deployed URL
KEY="X-Bot-Key: $BOT_SERVICE_KEY"

# Live inbound message → mobile Chat Monitor
curl -X POST $BASE/bot/inbound -H "$KEY" -H 'content-type: application/json' \
  -d '{"elder_phone_e164":"+628123456789","body":"Sudah senam pagi ini, badan enak 😊"}'

# Outbound companion reply
curl -X POST $BASE/bot/outbound -H "$KEY" -H 'content-type: application/json' \
  -d '{"elder_id":"<ID>","body":"Wah hebat, Eyang Uti! 🌟"}'

# Chair test → Progress chart
curl -X POST $BASE/assessments/chair-test -H "$KEY" -H 'content-type: application/json' \
  -d '{"elder_id":"<ID>","reps":13}'

# Exercise log → streak
curl -X POST $BASE/exercise-logs -H "$KEY" -H 'content-type: application/json' \
  -d '{"elder_id":"<ID>","method":"reply"}'

# Medication confirmed → slot flips
curl -X POST $BASE/medication-logs -H "$KEY" -H 'content-type: application/json' \
  -d '{"medication_id":"<MID>","elder_id":"<ID>","method":"emoji"}'

# Pain alert → push notification (THE demo moment)
curl -X POST $BASE/alerts -H "$KEY" -H 'content-type: application/json' \
  -d '{"elder_id":"<ID>","type":"pain_mention","payload":{"quote":"aduh, lutut saya sakit sekali"}}'
```

## 4. Integration + failure drills

Run the smoke script against the **deployed** URL on Day 2 evening and again after API freeze on Day 3. Timing bar: each endpoint responds < 500ms warm; push arrives < 10s from curl to device.

| Failure | Drill | Story |
|---|---|---|
| Venue Wi-Fi blocks Neon | Swap `DATABASE_URL` to local Docker, re-run migrate + seed, restart — target < 5 min. Rehearse Day 1. | B0.2 |
| Venue Wi-Fi blocks everything | Deployed backend reachable via cellular verified Day 2; phone hotspot at demo. | B9.3 |
| Expo push doesn't arrive | Alert insert still succeeds; mobile shows it via the 60s poll. Push is best-effort. | B7.2 |
| Backend dies mid-demo | Mobile mock-mode build carries the UI; narrate the live loop from the seeded data. | mobile M0.3 |
