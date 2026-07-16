# AGENTS.md — lively-mobile

Working agreement for any AI agent (and any human) building this repo. Read this before writing code. It is binding: a PR that ignores it gets sent back.

## What this repo is

The family-facing Lively app: Expo / React Native, TypeScript (Garuda Hacks 7.0, Health track). It reads and writes through `lively-backend` under a family-member JWT; it never talks to the database directly. Shared contract: [CORE.md](CORE.md) (a verbatim copy of the source of truth in `lively-backend` — do not edit it here; changes go through the backend and propagate to all four repos).

## The one rule: work the backlog

[docs/BACKLOG.md](docs/BACKLOG.md) is the plan of record. Everything you build traces to a story there.

1. **Read first, every session:** [docs/BACKLOG.md](docs/BACKLOG.md), [docs/UI-UX-GUIDELINES.md](docs/UI-UX-GUIDELINES.md), [docs/SUCCESS-CRITERIA.md](docs/SUCCESS-CRITERIA.md), [docs/TESTING.md](docs/TESTING.md), and [CORE.md](CORE.md). Don't invent work that isn't a story; if you find necessary work with no story, add one (acceptance criteria + UI states + test steps) before doing it.
2. **Priority order, no skipping ahead:** finish the P0 spine (M0→M5) before P1, and P1 before P2. Within an epic, stories are dependency-ordered.
3. **A mobile story ships all its UI states.** Every story lists them; a screen with only a happy path is unfinished. The [UI-UX-GUIDELINES.md](docs/UI-UX-GUIDELINES.md) §2 matrix is the definition of complete, and story M10.1 audits it.
4. **Tick the checklist as you go.** When a story's acceptance box is genuinely satisfied and its TESTING.md steps pass on a device, change `- [ ]` to `- [x]` in [docs/BACKLOG.md](docs/BACKLOG.md) **in the same PR**. The backlog is the shared, live progress record the whole team reads — never tick a box you haven't verified, never leave a finished box unticked.
5. **A story is done only when** all its boxes (including UI-state boxes) are `[x]`, its tests pass on a device, and the code is merged.

## Coordinate with the backend, don't fork the contract

Several stories depend on backend endpoints that are CORE.md amendments (auth, `GET /elders`, `GET /elders/:id/progress`, `PATCH /family-members/me`, and more — see the backend backlog). When one isn't live yet, build against **mock mode** (`EXPO_PUBLIC_USE_MOCKS=1`) using a fixture that matches the agreed response shape, and swap to the real API when it lands. If you need a field the contract doesn't have, raise it with the backend owner so CORE.md changes in all four repos — do not invent a local shape that then drifts.

## PRs and commits

- **Branch per story** (or per epic if small): `m4-chat-monitor`, `m8-alerts`. Never commit straight to `main`.
- **One logical story per PR.** Keep diffs reviewable.
- **PR description** states: which story (ID), which acceptance + UI-state boxes it ticks, and how it was verified (which TESTING.md states you forced on a device). Link the story.
- **Conventional commits**, imperative mood: `feat(chat): add inverted list with day separators and after-cursor poll`, `fix(home): show empty state for accounts with no elders`.
- **Do not** run destructive git operations, skip hooks (`--no-verify`), or bypass signing unless explicitly asked.

### Commit / PR text is human-authored — no AI fingerprints

This is a public hackathon repo. Commit messages and PR descriptions must read as written by an engineer:

- **No co-author trailers or attribution.** No `Co-Authored-By: Claude`, no `Co-Authored-By` any AI, no "Generated with Claude Code", no "🤖" footer, no tool self-references anywhere in commits or PRs.
- **No AI-jargon / filler:** avoid "delve", "leverage", "seamless", "robust", "elevate", "in today's fast-paced", "it's worth noting", "as an AI". Say what changed plainly.
- **No em-dashes.** Use commas, parentheses, or two sentences.
- **No emojis** in commit messages or PR descriptions. (Emoji in product UI copy — the Indonesian companion strings, empty-state text — is intended UX content and stays.)
- No inflated claims. State the change and how it was verified.

## Code + environment conventions

- Expo (managed), TypeScript, expo-router, TanStack Query (M0.3). Match existing file style; don't reformat code you aren't changing.
- No ad-hoc hex or font sizes in screens — pull from the design tokens (M0.2).
- Comments only where they state a non-obvious constraint. No comments narrating obvious code.
- **Secrets / config:** `BACKEND_API_URL` and flags via app config / env, never hardcoded to a private value in source. No API keys committed.
- **Windows dev machines:** prefer PowerShell; forward slashes in paths; no `make` (use package.json scripts); never retry a failed command unchanged more than once — diagnose instead.
- Test on a **physical device** in Expo Go, not just the simulator — touch targets, font scaling, and push behavior differ.

## Definition of done checklist (per PR)

- [ ] Implements exactly one backlog story (or a coherent slice named in the PR)
- [ ] All of that story's acceptance AND UI-state boxes ticked in docs/BACKLOG.md, in this PR
- [ ] Every applicable state (skeleton / empty / error / offline / success) built and verified on a device per docs/TESTING.md
- [ ] Honorific interpolation correct; Indonesian-first copy per UI-UX §4
- [ ] No secrets, no AI attribution, no em-dashes/emojis/AI-jargon in commits or PR text
