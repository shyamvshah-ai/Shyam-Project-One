// Fetches REAL end-of-day prices and writes src/data/prices.json.
//
//   npm run refresh-prices
//
// Run this on a machine with normal internet access (e.g. the family's home
// computer or home server). Schedule it once a day with cron (macOS/Linux) or
// Task Scheduler (Windows) to keep prices fresh — daily is plenty for learning.
//
// Data source: Stooq (https://stooq.com) free end-of-day CSV. No API key.
// Everything is converted to GBP (£) so the whole app is single-currency.
//
// The app reads the resulting JSON directly — there are no network calls at
// runtime, so nothing here needs to be secure or fast.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { UNIVERSE } from '../src/data/universe.ts'
import { isoDate, round2 } from './_shared.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/prices.json')

const DAYS_BACK = 760 // ~2 years of calendar days
const cutoff = new Date()
cutoff.setDate(cutoff.getDate() - DAYS_BACK)

// Which currency each source symbol is quoted in. Stooq US tickers are USD;
// London (.uk) quotes in pence (GBX) for most shares but pounds for some ETFs.
function sourceCurrency(source) {
  if (source.endsWith('.uk')) return 'GBX' // pence — see auto-correction below
  return 'USD'
}

async function fetchCsv(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// Returns a Map<isoDate, closePrice> from a Stooq daily CSV.
function parseStooq(csv) {
  const out = new Map()
  const lines = csv.trim().split(/\r?\n/)
  if (lines.length < 2 || !/^Date,/i.test(lines[0])) return out
  const header = lines[0].split(',')
  const di = header.indexOf('Date')
  const ci = header.indexOf('Close')
  if (di < 0 || ci < 0) return out
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const date = cols[di]
    const close = Number(cols[ci])
    if (date && Number.isFinite(close) && close > 0) out.set(date, close)
  }
  return out
}

async function stooqSeries(source) {
  const csv = await fetchCsv(`https://stooq.com/q/d/l/?s=${encodeURIComponent(source)}&i=d`)
  return parseStooq(csv)
}

// --- FX: fetch GBP per 1 USD (Stooq gives USDGBP as GBP per USD). ------------
async function fetchFxUsdToGbp() {
  try {
    const m = await stooqSeries('usdgbp')
    const last = [...m.values()].at(-1)
    if (last && last > 0.3 && last < 1.2) return last
  } catch {
    /* fall through */
  }
  console.warn('  ! Could not fetch USD→GBP FX, using fallback 0.79')
  return 0.79
}

async function main() {
  console.log('Fetching real end-of-day prices from Stooq (this may take a minute)…')
  const usdToGbp = await fetchFxUsdToGbp()
  console.log(`  USD→GBP = ${usdToGbp}`)

  const raw = {} // ticker -> Map<date, gbpClose>
  const allDates = new Set()

  for (const asset of UNIVERSE) {
    try {
      const m = await stooqSeries(asset.source)
      if (m.size === 0) throw new Error('empty/blocked')

      const cur = sourceCurrency(asset.source)
      const gbp = new Map()
      for (const [date, close] of m) {
        if (new Date(date) < cutoff) continue
        let v = close
        if (cur === 'USD') v = close * usdToGbp
        else if (cur === 'GBX') v = close / 100 // pence → pounds
        gbp.set(date, v)
      }

      // Sanity check against the reference price: if a London ETF was actually
      // quoted in pounds (not pence), values will be ~100x too small — undo it.
      const latest = [...gbp.values()].at(-1)
      if (latest && asset.seedPrice > 0) {
        const ratio = latest / asset.seedPrice
        if (ratio < 0.02) for (const [d, v] of gbp) gbp.set(d, v * 100)
      }

      raw[asset.ticker] = gbp
      for (const d of gbp.keys()) allDates.add(d)
      process.stdout.write('.')
    } catch (err) {
      console.warn(`\n  ! ${asset.ticker} (${asset.source}): ${err.message} — skipping`)
    }
    await new Promise((r) => setTimeout(r, 120)) // be polite to the server
  }
  console.log('')

  const dates = [...allDates].sort()
  if (dates.length === 0) {
    console.error('No data fetched — leaving existing prices.json untouched.')
    process.exit(1)
  }

  // Align every series to the shared date axis, forward-filling gaps (holidays
  // differ across exchanges) so the app can index by date safely.
  const series = {}
  let ok = 0
  for (const asset of UNIVERSE) {
    const m = raw[asset.ticker]
    if (!m) continue
    const arr = []
    let last = null
    for (const d of dates) {
      if (m.has(d)) last = m.get(d)
      arr.push(last == null ? null : round2(last))
    }
    // Back-fill any leading nulls with the first known value.
    const firstKnown = arr.find((v) => v != null)
    for (let i = 0; i < arr.length && arr[i] == null; i++) arr[i] = firstKnown ?? asset.seedPrice
    series[asset.ticker] = arr
    ok++
  }

  const payload = { generatedAt: new Date().toISOString(), real: true, currency: 'GBP', dates, series }
  writeFileSync(OUT, JSON.stringify(payload) + '\n')
  console.log(`Done. Real prices for ${ok}/${UNIVERSE.length} assets, ${dates.length} days.`)
  console.log(`Latest trading day: ${dates.at(-1)} (as of ${isoDate(new Date())}).`)
  if (ok < UNIVERSE.length) {
    console.log('Some assets were skipped (symbol not found or temporarily blocked).')
    console.log('The app hides assets with no price data and keeps working normally.')
    console.log('Re-run later to pick them up.')
  }
}

main().catch((err) => {
  console.error('refresh-prices failed:', err.message)
  console.error('The app keeps working from the existing prices.json.')
  process.exit(1)
})
