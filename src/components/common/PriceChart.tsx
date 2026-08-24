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

// A single holding/asset price line, in £, with an auto-zoomed vertical axis so
// movement is visible. Pass `since` (an ISO date) to start the line there — e.g.
// the day the child bought it — otherwise `days` limits it (0 = full history).
//
// Optional extras (used by the "My Money" holding tiles): `xLabel`/`yLabel` add
// titles under/beside the axes; `buyPrice` draws a dashed "you bought here" line
// and, together with `fitDomain`, snaps the vertical axis tightly around the buy
// price and the actual price range so the height of the line is proportionate to
// how big the move since buying really was.
export default function PriceChart({
  ticker,
  days = 0,
  since,
  height = 200,
  xLabel,
  yLabel,
  buyPrice,
  fitDomain = false,
}: {
  ticker: string
  days?: number
  since?: string
  height?: number
  xLabel?: string
  yLabel?: string
  buyPrice?: number
  fitDomain?: boolean
}) {
  const data = useMemo(
    () => (since ? priceHistorySince(ticker, since) : priceHistory(ticker, days || undefined)),
    [ticker, days, since],
  )
  if (data.length < 2)
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        This chart fills in as the days go by — check back tomorrow!
      </p>
    )
  const rising = data[data.length - 1].price >= data[0].price
  const colour = rising ? '#34d399' : '#fb7185'

  // Proportionate vertical axis: fit tightly around the real price range (and
  // the buy price, so the "you bought here" line is always on screen), with a
  // little breathing room. A small move then looks small and a big move looks
  // big — the axis scale reflects the size of the move.
  const labelled = Boolean(xLabel || yLabel)
  let yDomain: [number | 'auto', number | 'auto'] = ['auto', 'auto']
  if (fitDomain) {
    const prices = data.map((d) => d.price)
    if (buyPrice !== undefined) prices.push(buyPrice)
    const lo = Math.min(...prices)
    const hi = Math.max(...prices)
    const pad = (hi - lo) * 0.15 || hi * 0.02 || 1
    yDomain = [Math.max(0, lo - pad), hi + pad]
  }

  // Titled axes need room; the compact modal chart keeps its tight margins.
  const margin = labelled
    ? { top: 8, right: 12, left: 8, bottom: 22 }
    : { top: 5, right: 5, left: -18, bottom: 0 }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          minTickGap={40}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          height={xLabel ? 34 : undefined}
        >
          {xLabel && (
            <Label value={xLabel} position="insideBottom" offset={0} fill="#94a3b8" fontSize={12} />
          )}
        </XAxis>
        <YAxis
          tickFormatter={(v) => moneyExact(v)}
          width={yLabel ? 76 : 64}
          domain={yDomain}
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
          formatter={(v: number) => [moneyExact(v), 'Price']}
          labelFormatter={(l) => shortDate(String(l))}
        />
        {buyPrice !== undefined && (
          <ReferenceLine
            y={buyPrice}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            ifOverflow="extendDomain"
          >
            <Label
              value={`You bought · ${moneyExact(buyPrice)}`}
              position="insideTopLeft"
              fill="#cbd5e1"
              fontSize={11}
            />
          </ReferenceLine>
        )}
        <Line type="monotone" dataKey="price" stroke={colour} strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
