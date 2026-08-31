// Fetches REAL end-of-day prices and writes src/data/prices.json.
//
//   npm run refresh-prices
//
// Data source: Yahoo Finance's public chart endpoint (no API key). It works
// from servers (e.g. GitHub Actions), covers US and London-listed names, and
// reports each series' currency so we can convert everything to GBP (£).
//
// The app reads the resulting JSON directly — there are no network calls at
// runtime, so nothing here needs to be fast or secure.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { UNIVERSE } from '../src/data/universe.ts'
import { isoDate, round2 } from './_shared.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/prices.json')

const CHART = 'https://query1.finance.yahoo.com/v8/finance/chart/'
const RANGE = '5y'
// Keep a full five years of history so the "5Y" chart really spans five years.
const cutoff = new Date()
cutoff.setFullYear(cutoff.getFullYear() - 5)

// A few symbols don't follow the simple rule (e.g. ASOS trades as ASC.L).
const OVERRIDES = {
  'asos.uk': 'ASC.L', // ASOS plc renamed its ticker to ASC
  'samsung.kr': '005930.KS', // Samsung Electronics, Korea listing (KRW)
}

// Map our internal Stooq-style symbol (e.g. "tsco.uk", "aapl.us") to a Yahoo
// symbol. London names use the ".L" suffix; US names are the bare ticker.
function yahooSymbol(source) {
  if (OVERRIDES[source]) return OVERRIDES[source]
  const dot = source.lastIndexOf('.')
  const base = (dot >= 0 ? source.slice(0, dot) : source).toUpperCase()
  const suffix = dot >= 0 ? source.slice(dot + 1) : ''
  if (suffix === 'uk') return `${base}.L`
  return base
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Returns { currency, points: Map<isoDate, closeInNativeCurrency> }.
async function fetchChart(symbol) {
  const json = await fetchJson(`${CHART}${encodeURIComponent(symbol)}?range=${RANGE}&interval=1d`)
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('no result')
  const currency = result.meta?.currency ?? 'USD'
  const stamps = result.timestamp ?? []
  const closes = result.indicators?.quote?.[0]?.close ?? []
  const points = new Map()
  for (let i = 0; i < stamps.length; i++) {
    const close = closes[i]
    if (close == null || !Number.isFinite(close)) continue
    const date = isoDate(new Date(stamps[i] * 1000))
    if (new Date(date) < cutoff) continue
    points.set(date, close)
  }
  return { currency, points }
}

// Returns £ per 1 unit of any currency, fetching + caching FX rates as needed
// (so London pence, US dollars, Korean won, euros, etc. all convert to £).
function makeFxToGbp() {
  const cache = { GBP: 1, GBX: 0.01, GBp: 0.01 }
  return async function toGbp(currency) {
    if (cache[currency] !== undefined) return cache[currency]
    try {
      // Yahoo "GBP{cur}=X" = units of {cur} per 1 GBP; we want £ per 1 {cur}.
      const { points } = await fetchChart(`GBP${currency}=X`)
      const perGbp = [...points.values()].at(-1)
      if (perGbp && perGbp > 0) return (cache[currency] = 1 / perGbp)
    } catch {
      /* fall through */
    }
    console.warn(`  ! No FX rate for ${currency} — affected assets skipped`)
    return (cache[currency] = null)
  }
}

async function main() {
  console.log('Fetching real end-of-day prices from Yahoo Finance…')
  const fxToGbp = makeFxToGbp()
  const usdRate = await fxToGbp('USD')
  console.log(`  £ per $1 = ${usdRate ? usdRate.toFixed(4) : 'n/a'}`)

  const raw = {} // ticker -> Map<date, gbpClose>
  const local = {} // ticker -> { currency, price } in the asset's own currency
  const allDates = new Set()

  for (const asset of UNIVERSE) {
    try {
      const { currency, points } = await fetchChart(yahooSymbol(asset.source))
      if (points.size === 0) throw new Error('empty')
      const rate = await fxToGbp(currency)
      if (rate == null) throw new Error(`no FX for ${currency}`)
      const gbp = new Map()
      for (const [date, close] of points) gbp.set(date, close * rate)
      raw[asset.ticker] = gbp
      // Latest price in the asset's own currency, for display alongside £.
      const lastNative = [...points.values()].at(-1)
      if (lastNative != null) local[asset.ticker] = { currency, price: round2(lastNative) }
      for (const d of gbp.keys()) allDates.add(d)
      process.stdout.write('.')
    } catch (err) {
      console.warn(`\n  ! ${asset.ticker} (${asset.source} → ${yahooSymbol(asset.source)}): ${err.message} — skipping`)
    }
    await new Promise((r) => setTimeout(r, 120)) // be polite
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
    const firstKnown = arr.find((v) => v != null)
    for (let i = 0; i < arr.length && arr[i] == null; i++) arr[i] = firstKnown ?? asset.seedPrice
    series[asset.ticker] = arr
    ok++
  }

  const payload = { generatedAt: new Date().toISOString(), real: true, currency: 'GBP', dates, series, local }
  writeFileSync(OUT, JSON.stringify(payload) + '\n')
  console.log(`Done. Real prices for ${ok}/${UNIVERSE.length} assets, ${dates.length} days.`)
  console.log(`Latest trading day in data: ${dates.at(-1)}.`)
  if (ok < UNIVERSE.length) {
    console.log('Some assets were skipped (symbol not found). The app hides those and keeps working.')
  }
}

main().catch((err) => {
  console.error('refresh-prices failed:', err.message)
  console.error('The app keeps working from the existing prices.json.')
  process.exit(1)
})
