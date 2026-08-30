# CLAUDE.md — working notes for Claude Code

This file is read automatically at the start of every session. It exists so a
**fresh session can pick up where the last one left off** without re-explaining
everything. Read the `README.md` too for the product tour.

## What this is

**Junior Traders** — a friendly, game-like web app that teaches two kids
(**Sai, 10** and **Leila, 13**) the basics of investing with **pretend money**.
No real brokerage, no real money, nothing at stake. Every feature should *teach*
something and stay kid-friendly (big clear numbers, plain English, gentle tone).

The owner, **Shyam, is non-technical** and wants Claude to build and ship
everything end to end. So: make the change, build it, verify it in a real
browser, commit, push, and deploy — then explain what changed in plain language.
Don't hand back terminal instructions for him to run.

## Branch, commit & deploy rules

- **Work on the branch `claude/kids-investing-dashboard-9bwfks`.** This is the
  project's trunk (there is no separate `main`). Commit and push here.
- Push with `git push -u origin claude/kids-investing-dashboard-9bwfks`.
- **Deploying** = push, then trigger the GitHub Actions workflow
  `.github/workflows/deploy.yml` (`workflow_dispatch` on that branch). It also
  runs daily on a schedule. It builds, fetches real prices, and publishes to
  **GitHub Pages: https://shyamvshah-ai.github.io/Shyam-Project-One/**
- After deploying, confirm the run went green via the Actions logs before
  telling Shyam it's live. Kids may need to reload to get the new version.

## Stack & how to build

- **Vite + React 18 + TypeScript (strict) + Tailwind CSS v3 + Recharts 2.**
- Typecheck: `npx tsc -b` · Full build: `npm run build` (runs `tsc -b && vite build`).
- Both must pass clean (strict TS, `noUnusedLocals`) before committing.

## How to verify a change (important)

The sandbox **cannot reach external hosts** (market data, Supabase, company
logos all fail with `ERR_TUNNEL_CONNECTION_FAILED` — those errors are benign).
So verify UI changes with **Playwright against a local preview**:

1. `npm run build` then `npx vite preview --port <pick-one> --strictPort`
2. Drive it with `playwright-core` + the pre-installed Chromium at
   `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (`--no-sandbox`).
3. Clear `localStorage` first for a clean state; filter out the tunnel/logo
   console errors when asserting "no errors".
4. To test date-dependent logic (weekly/daily change), mock the browser clock
   with `page.addInitScript` overriding `Date` — see prior work.

## Prices (no runtime backend)

- The app reads **`src/data/prices.json`** only — no live calls in the browser.
- `scripts/refresh-prices.mjs` (`npm run refresh-prices`) fetches **real EOD**
  prices from Yahoo Finance, converts to **£**, and rewrites that file. It runs
  in CI daily (runners have internet; the browser can't).
- `scripts/generate-bootstrap-prices.mjs` writes a **placeholder** snapshot
  (`real: false`) so the app works before the first real refresh. Regenerate it
  if you change the price date range. History currently spans **5 years**.
- `src/lib/prices.ts` is the single read point (`latestPrice`, `priceOn`,
  `dailyChange`, `weeklyChange`, `priceHistory`, `priceHistorySince`, …).

## State, storage & sync

- Central store: **`src/state/store.tsx`** (reducer + context). All money rules
  live in the reducer (`BUY`, `SELL`, `TOP_UP`, `CHECK_IN`, `EDIT_PROFILE`,
  `SET_LOCK`, `RESET`, `HYDRATE`).
- Persists to `localStorage` key **`money-explorers:v1`**. `CURRENT_VERSION` in
  `store.tsx` gates old saves — **bump it only when you intend to wipe local
  state** (it discards saves from an older shape).
- Optional cross-device **sync via Supabase** (`src/lib/syncConfig.ts`,
  `src/state/sync.ts`) keyed by a **family code**; one JSON blob per code,
  last-write-wins. The Supabase key shipped is a public *publishable* key (safe).
- Two accounts (`sai`, `leila`) + a Parent view. Names/emojis/colours are
  **editable in the Parent view** (so other families can make it their own).
  Per-profile 4-digit **passcodes** gate the picker; the grown-up code is a
  master key. `RESET` keeps identity, allowance and passcodes, zeroes the money.

## File map (the bits you'll touch most)

- `src/components/kid/` — `PortfolioView` (My Money; a compact one-line-per-
  holding list — tap a row to open its chart), `ExploreView`, `TradeModal` (buy/sell in £),
  `ChartsView`, `AssetChartModal` (Explore £ chart, change matches the range),
  `HoldingChartModal` (the expanded % -since-bought chart), `RewardsView`,
  `JournalView` (diary), `KidDashboard`.
- `src/components/parent/ParentDashboard.tsx` — overview, allowance, edit
  profiles, passcodes, backup/restore (download/upload the whole state as JSON;
  restore uses the `RESTORE` action which bumps `epoch` so it wins on sync),
  start-over.
- `src/components/common/` — `PriceChart` (labelled line chart; `percent` +
  `percentBase` switches it to show % change vs the average buy price, starting
  at 0% and ending on the holding's real gain), `ui.tsx` (Card, GainPill with a
  `pctOnly` mode, Sparkline), `CompanyLogo`, `Jargon`.
- `src/lib/` — `prices.ts`, `portfolio.ts` (all the money maths), `format.ts`
  (money + date helpers), `locks.ts`, `storage.ts`.
- `src/data/` — `universe.ts` (the investable list + blurbs), `prices.json`,
  `seed.ts` (fresh start: £1,000 each, nothing invested).

## Roadmap context

Shyam is considering scaling to **multiple families** (works today via separate
family codes) and eventually a **fantasy-league leaderboard for ~30 people** —
which would need real logins + one row per player + a league leaderboard
(Supabase Auth + Row-Level Security), replacing the single-blob sync. Not built
yet; see the chat history if that comes up.
