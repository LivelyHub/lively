# lively-landing — Spec

> The public marketing/pitch site for Lively. This spec covers only the landing-page-specific implementation — the shared data model and API (not consumed here) live in [CORE.md](CORE.md).

## 1. Hackathon context
| Field | Value |
|-------|-------|
| Event | Garuda Hacks 7.0 (offline) |
| Submit by | 2026-07-18 — exact time 🔴 TBD |
| QUALIFICATION GATE | Working demo + repo + pitch deck submitted |
| Judging | 🔴 TBD — criteria/weights not yet published |

**Chosen track:** Health — Lively targets the health-literacy and eldercare gap between urban and rural Indonesian families named in the theme brief, using a fall-risk assessment (30s Chair Stand) and daily strength coaching as the clinical backbone.

## 2. Problem & target user
**User:** first-time visitors — judges, potential family-customer users, and press — who need to understand what Lively is in under 30 seconds. **Problem:** the product's core insight (a WhatsApp bot that texts like a human, aimed at elders who'll never install an app) doesn't come across from a screenshot alone; it needs framing.

## 3. Concept
- Hero: one-sentence positioning + tagline, immediately legible without scrolling.
- Problem section: Indonesia's ageing-society stat, the app-adoption gap for elders, why WhatsApp is the right surface.
- How it works: split visual — elder side (pure WhatsApp, text only: daily exercise, medicine reminders) vs family side (the mobile app: setup, chat monitor, progress, and safety alerts if the elder goes quiet or mentions pain).
- Companions preview: Mbak Asih / Mas Budi cards, echoing the mobile app's selection flow.
- CTA: for judges, links to demo video/repo; for future family users, a waitlist or app-store placeholder (roadmap, not MVP).
- Alternative considered: a single long-scroll story page vs a more app-marketing-site layout with nav. Chose long-scroll — matches a 3-minute pitch narrative better than a multi-page site under hackathon time.

## 4. MVP features (YAGNI-tight)
**In scope (the demoable spine):**
- Hero section with positioning + tagline
- Problem section (ageing Indonesia framing)
- How-it-works section (elder side vs family side)
- Companions preview (Mbak Asih, Mas Budi)
- CTA section
- Mobile-responsive layout

**Explicitly NOT in MVP** → §6.

## 5. Architecture
Vite + React + TypeScript, static site, no backend calls, no auth.

```
Browser ──▶ Vite/React static build ──▶ hosted (host TBD)
```

Styling: Tailwind CSS utility classes + shadcn/ui for structured components (buttons, cards) + reactbits for animated/visual flourishes (hero, transitions). No state management library needed — no dynamic data at MVP.

## 6. Non-goals
- No waitlist backend / email capture — CTA links out or is a static mailto at MVP.
- No CMS — copy is hardcoded in components, edited via git.
- No auth, no account creation on this site — that's `lively-mobile`'s job.
- No blog/content marketing — single pitch page only.

## 7. Risks & unknowns
- 🔴 No brand/visual direction locked (colors, type, tone) — resolve Day 1 before building sections, or the page ships generic.
- 🟡 Hosting provider not chosen — pick on Day 1 (Vercel/Netlify both trivial for a Vite site).
- 🟢 Vite + Tailwind + shadcn is a low-risk, well-documented stack for a static page.

## 8. Submission checklist (mapped to THIS event's deliverables)
- [ ] Working demo (landing page deployed and reachable)
- [ ] Public repo with README, LICENSE, `.gitignore`, no committed secrets
- [ ] Pitch deck (🔴 TBD which repo hosts it — decide Day 1, avoid duplicating effort with `lively-backend`/other repos)

**Doc sources:** none fetched — all facts above came directly from the user during drafting (2026-07-16).
