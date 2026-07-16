# lively-backend

> REST API + data layer for Lively — the shared brain between the family mobile app and the WhatsApp companion bot.

**Status:** 📐 Pre-build spec — see [SPEC.md](SPEC.md) and [PLAN.md](PLAN.md). Shared core: [CORE.md](CORE.md).

| | |
|---|---|
| Hackathon | Garuda Hacks 7.0 |
| Submit by | 2026-07-18 · exact time 🔴 TBD · prize 🔴 TBD |
| Track | Health |
| Gate | Working demo + repo + pitch deck submitted |
| Stack | TypeScript · Fastify · PostgreSQL (Neon) |

Owns the schema and API contract that `lively-mobile` and `lively-bot` both depend on — see [CORE.md](CORE.md) for the full data model and endpoint list.

## Notes

- Public repo. No secrets in source — config via env vars only (`.env.example` documents names; real values live in a gitignored `.env`).
- Part of a 4-repo Lively build (`lively-landing`, `lively-mobile`, `lively-backend`, `lively-bot`) sharing [CORE.md](CORE.md) verbatim.

## License

MIT — see LICENSE.
