import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { KidProfile } from '../../types'
import { valueHistory } from '../../lib/portfolio'
import { priceHistory } from '../../lib/prices'
import { getAsset } from '../../data/universe'
import { money, moneyExact, percent, shortDate } from '../../lib/format'
import { Card, SectionTitle } from '../common/ui'

// "Charts" — see how the whole portfolio has grown, and each holding's price.

const RANGES = [
  { label: '1M', days: 21 },
  { label: '3M', days: 63 },
  { label: '1Y', days: 252 },
  { label: 'All', days: 0 },
]

export default function ChartsView({ kid, detailed }: { kid: KidProfile; detailed: boolean }) {
  const history = useMemo(() => valueHistory(kid), [kid])
  const owned = kid.holdings.map((h) => h.ticker)
  const [ticker, setTicker] = useState<string>(owned[0] ?? '')
  const [rangeIdx, setRangeIdx] = useState(detailed ? 3 : 1)

  const first = history[0]?.value ?? 0
  const last = history[history.length - 1]?.value ?? 0
  const change = last - first
  const changePct = first > 0 ? change / first : 0

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>Your money over time</SectionTitle>
        {history.length < 2 ? (
          <p className="text-indigo-500">Make a few trades and check back to watch your line grow!</p>
        ) : (
          <>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-indigo-900">{money(last)}</span>
              <span className={`font-semibold ${change >= 0 ? 'text-up' : 'text-down'}`}>
                {change >= 0 ? '▲' : '▼'} {money(Math.abs(change))} ({percent(changePct)})
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={history} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="val" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  minTickGap={40}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  tickFormatter={(v) => money(v)}
                  width={64}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip content={<ValueTooltip detailed={detailed} />} />
                {detailed && (
                  <Line
                    type="monotone"
                    dataKey="deposited"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                    name="Money paid in"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fill="url(#val)"
                  name="What it's worth"
                />
              </AreaChart>
            </ResponsiveContainer>
            {detailed && (
              <p className="mt-1 text-center text-xs text-indigo-400">
                <span className="text-brand-600">Purple</span> = what your investments are worth ·{' '}
                <span className="text-amber-500">dashed</span> = money you paid in
              </p>
            )}
          </>
        )}
      </Card>

      <Card>
        <SectionTitle>A closer look at one thing</SectionTitle>
        {owned.length === 0 ? (
          <p className="text-indigo-500">Once you own something, its price chart shows up here.</p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {owned.map((t) => {
                const a = getAsset(t)
                return (
                  <button
                    key={t}
                    onClick={() => setTicker(t)}
                    className={`pill ${
                      ticker === t ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'
                    }`}
                  >
                    {a?.emoji} {a?.name}
                  </button>
                )
              })}
            </div>

            {detailed && (
              <div className="mb-2 flex gap-1">
                {RANGES.map((r, i) => (
                  <button
                    key={r.label}
                    onClick={() => setRangeIdx(i)}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      rangeIdx === i ? 'bg-indigo-900 text-white' : 'bg-indigo-50 text-indigo-500'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            <HoldingChart ticker={ticker} days={detailed ? RANGES[rangeIdx].days : 90} />
          </>
        )}
      </Card>
    </div>
  )
}

function HoldingChart({ ticker, days }: { ticker: string; days: number }) {
  const data = useMemo(() => priceHistory(ticker, days || undefined), [ticker, days])
  if (data.length < 2) return <p className="text-indigo-400">Not enough price history yet.</p>
  const rising = data[data.length - 1].price >= data[0].price
  const colour = rising ? '#16a34a' : '#dc2626'
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
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

interface TooltipProps {
  active?: boolean
  payload?: { payload: { date: string; value: number; deposited: number } }[]
  detailed: boolean
}

function ValueTooltip({ active, payload, detailed }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0].payload
  return (
    <div className="rounded-xl bg-indigo-950 px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-bold">{shortDate(p.date)}</div>
      <div>Worth: {money(p.value)}</div>
      {detailed && <div className="text-amber-300">Paid in: {money(p.deposited)}</div>}
    </div>
  )
}
