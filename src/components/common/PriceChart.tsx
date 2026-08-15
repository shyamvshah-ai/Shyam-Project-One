import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { priceHistory } from '../../lib/prices'
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
// movement is visible. `days` of 0 means the full history.
export default function PriceChart({
  ticker,
  days,
  height = 200,
}: {
  ticker: string
  days: number
  height?: number
}) {
  const data = useMemo(() => priceHistory(ticker, days || undefined), [ticker, days])
  if (data.length < 2) return <p className="text-slate-400">Not enough price history yet.</p>
  const rising = data[data.length - 1].price >= data[0].price
  const colour = rising ? '#34d399' : '#fb7185'
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          minTickGap={40}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
        />
        <YAxis
          tickFormatter={(v) => moneyExact(v)}
          width={64}
          domain={['auto', 'auto']}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
        />
        <Tooltip
          formatter={(v: number) => [moneyExact(v), 'Price']}
          labelFormatter={(l) => shortDate(String(l))}
        />
        <Line type="monotone" dataKey="price" stroke={colour} strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
