// Generates the PLACEHOLDER price history shipped with the app so it works on
// first run (before anyone fetches real data).
//
//   node scripts/generate-bootstrap-prices.mjs
//
// These are NOT real market prices. They are a deterministic, realistic-looking
// random walk that ends near each asset's reference price. Running
// `npm run refresh-prices` replaces this file with real end-of-day data.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { UNIVERSE } from '../src/data/universe.ts'
import { mulberry32, hashSeed, businessDays, round2 } from './_shared.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/prices.json')

const TRADING_DAYS = 504 // ~2 years of weekdays
const END = new Date('2026-08-10T00:00:00Z')

const dates = businessDays(END, TRADING_DAYS)
const series = {}

for (const asset of UNIVERSE) {
  const rng = mulberry32(hashSeed(asset.ticker))
  // ETFs and staples wobble less than individual growth stocks.
  const vol = asset.kind === 'etf' ? 0.011 : 0.02
  // A gentle per-asset yearly drift (some up, some flat/down) — teaches that
  // markets don't only go up. Deterministic from the ticker.
  const annualDrift = (rng() - 0.45) * 0.35
  const dailyDrift = annualDrift / 252

  // Build a forward random walk, then rescale so the final value lands on the
  // reference price. That keeps "today" believable while the path stays random.
  const raw = [1]
  for (let i = 1; i < dates.length; i++) {
    // Box–Muller for a normal-ish shock.
    const u1 = Math.max(rng(), 1e-9)
    const u2 = rng()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const ret = dailyDrift + vol * z
    raw.push(raw[i - 1] * Math.exp(ret))
  }
  const scale = asset.seedPrice / raw[raw.length - 1]
  series[asset.ticker] = raw.map((v) => round2(Math.max(v * scale, 0.01)))
}

const payload = {
  generatedAt: new Date().toISOString(),
  real: false,
  currency: 'GBP',
  dates,
  series,
}

writeFileSync(OUT, JSON.stringify(payload) + '\n')
console.log(
  `Wrote placeholder prices for ${UNIVERSE.length} assets ` +
    `(${dates.length} days) to ${OUT}`,
)
console.log('These are NOT real prices — run "npm run refresh-prices" to fetch real data.')
