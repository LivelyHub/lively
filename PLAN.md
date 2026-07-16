# lively-landing — Plan

**Window:** 2026-07-16 → 2026-07-18 (Garuda Hacks 7.0, offline). ~3 days. Solo/small-team repo owner. No dependency on the other three repos being finished — this repo can ship independently.

## Setup (Day 0 / early Day 1)
- Env: none required at MVP (static site, no API calls, no secrets). Ship `.env.example` anyway for consistency — currently empty besides a placeholder.
- Tooling: Node.js, Vite, Tailwind CSS, shadcn/ui CLI, reactbits (component snippets, not an npm dependency — copy-pasted per component).
- Repo: public; README skeleton + license + `.gitignore` (this pass).

## Definition of Done (the bar)
1. Landing page live (deployed, e.g. Vercel/Netlify — 🟡 host TBD) explaining the product, problem, and demo hook.
2. Sections: hero/pitch, problem (ageing Indonesia stat), how it works (elder side WhatsApp / family side app), two companions preview, CTA.
3. Mobile-responsive — judges and family users will view on phones.
> Item 1 satisfies part of the qualification gate (a working, reachable artifact); the pitch deck is separate (🔴 TBD which repo hosts it — see SPEC.md §8).

## Day-by-day
**Day 1 — 2026-07-16 — scaffold + content**
- `npm create vite@latest` (React + TypeScript template), install Tailwind, init shadcn/ui, pull in 2–3 reactbits components for hero/animation flair.
- Write copy: pitch, tagline ("Strong today, independent tomorrow."), problem statement.
- 🔴 Risk: no brand/visual direction locked yet — resolve before building sections (use `brand-design` skill if available, otherwise pick a palette fast and move on).

**Day 2 — 2026-07-17 — sections + responsiveness**
- Build hero, problem, how-it-works, companions preview, CTA sections.
- Mobile pass — test on an actual phone, not just devtools.
- Wire real screenshots/video from `lively-mobile` and `lively-bot` demo once available (placeholder until then).

**Day 3 — 2026-07-18 — deploy, polish, submit**
- Deploy to hosting (🟡 TBD provider).
- Final copy/typo pass, confirm no placeholder text ships.
- Submit with margin before deadline.

## Honest feasibility verdict
Fully achievable in this window — a static Vite site with Tailwind/shadcn is low-risk, and this repo has no cross-repo blocking dependency. Biggest risk is not technical but content: without real screenshots/demo footage from the other three repos, the landing page ships with placeholders. Mitigation: build the layout Day 1–2 with placeholder content, swap in real assets Day 3 once the other repos have something demoable.

Cut-order if time compresses: drop the companions-preview animation and any reactbits flourish first; the irreducible core is hero pitch + problem + how-it-works, deployed and reachable — that alone satisfies the "working demo" gate for this repo.
