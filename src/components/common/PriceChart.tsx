import { useMemo } from 'react'
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { priceHistory, priceHistorySince } from '../../lib/prices'
import { moneyExact, shortDate } from '../../lib/format'

// Shared time ranges for every price chart in the app.
export const RANGES = [
  { label: '1W', days: 5 },
  { label: '1M', days: 21 },
  { label: '3M', days: 63 },
  { label: '1Y', days: 252 },
  { label: '5Y', days: 1260 },
  { label: 'All', days: 0 },
]

/** A "nice" round, whole-number step (…1, 2, 5, 10, 20, 50…) at or above `x`. */
function niceStep(x: number): number {
  if (!isFinite(x) || x <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(x)))
  const n = x / pow
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return m * pow
}

/**
 * Whole-number % tick marks spanning [min, max] and always including 0. Steps
 * are at least 1 apart so two ticks can never both round to "0%", and a flat
 * line still gets a sensible ±1% window.
 */
function roundTicks(min: number, max: number): { lo: number; hi: number; ticks: number[] } {
  let from = Math.min(min, 0)
  let to = Math.max(max, 0)
  if (from === to) {
    from -= 1
    to += 1
  }
  const step = Math.max(1, Math.round(niceStep((to - from) / 4)))
  const lo = Math.floor(from / step) * step
  const hi = Math.ceil(to / step) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(v)
  return { lo, hi, ticks }
}

// A single holding/asset price line. Pass `since` (an ISO date) to start the line
// there — e.g. the day the child bought it — otherwise `days` limits it (0 = full
// history). Default mode plots the price in £ with an auto-zoomed axis.
//
// Extras for the "My Money" holding tiles: `xLabel`/`yLabel` add axis titles, and
// `percent` switches the line to show the *percentage change* since the first day
// shown — so every chart starts at 0%. In that mode the vertical axis uses
// round-number % steps, a dashed 0% line marks where they bought, and the
// tooltip reads in %.
export default function PriceChart({
  ticker,
  days = 0,
  since,
  height = 200,
  xLabel,
  yLabel,
  percent = false,
}: {
  ticker: string
  days?: number
  since?: string
  height?: number
  xLabel?: string
  yLabel?: string
  percent?: boolean
}) {
  const raw = useMemo(
    () => (since ? priceHistorySince(ticker, since) : priceHistory(ticker, days || undefined)),
    [ticker, days, since],
  )
  if (raw.length < 2)
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        This chart fills in as the days go by — check back tomorrow!
      </p>
    )

  // Percent mode: measure every day against the first day shown, so the line
  // always begins at exactly 0%.
  const base = raw[0].price
  const data =
    percent && base > 0
      ? raw.map((p) => ({ date: p.date, value: (p.price / base - 1) * 100 }))
      : raw.map((p) => ({ date: p.date, value: p.price }))
  const percentMode = percent && base > 0

  const rising = data[data.length - 1].value >= data[0].value
  const colour = rising ? '#34d399' : '#fb7185'
  const labelled = Boolean(xLabel || yLabel)

  // Round-number vertical axis for the percent tiles; the plain £ chart keeps
  // its auto axis (used by the Explore price pop-up).
  let yDomain: [number, number] | ['auto', 'auto'] = ['auto', 'auto']
  let yTicks: number[] | undefined
  if (percentMode) {
    const vals = data.map((d) => d.value)
    const { lo, hi, ticks } = roundTicks(Math.min(...vals), Math.max(...vals))
    yDomain = [lo, hi]
    yTicks = ticks
  }

  const fmtPctWhole = (v: number) => `${v > 0 ? '+' : ''}${Math.round(v)}%`
  const fmtPctExact = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`
  const yTickFormatter = percentMode ? fmtPctWhole : (v: number) => moneyExact(v)

  // Titled axes need room; the compact modal chart keeps its tight margins.
  const margin = labelled
    ? { top: 8, right: 12, left: 8, bottom: 22 }
    : { top: 5, right: 5, left: -18, bottom: 0 }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={margin}>
        {/* Horizontal-only grid keeps the tile calm. */}
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          minTickGap={60}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          height={xLabel ? 34 : undefined}
        >
          {xLabel && (
            <Label value={xLabel} position="insideBottom" offset={0} fill="#94a3b8" fontSize={12} />
          )}
        </XAxis>
        <YAxis
          tickFormatter={yTickFormatter}
          ticks={yTicks}
          domain={yDomain}
          width={64}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
        >
          {yLabel && (
            <Label
              value={yLabel}
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: 'middle', fill: '#94a3b8', fontSize: 12 }}
            />
          )}
        </YAxis>
        <Tooltip
          formatter={(v: number) => [percentMode ? fmtPctExact(v) : moneyExact(v), percentMode ? 'Change' : 'Price']}
          labelFormatter={(l) => shortDate(String(l))}
        />
        {/* 0% baseline = the price they bought at (no label needed). */}
        {percentMode && (
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />
        )}
        {/* Straight segments — the price path, not a smoothed curve. */}
        <Line
          type={percentMode ? 'linear' : 'monotone'}
          dataKey="value"
          stroke={colour}
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
