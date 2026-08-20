import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { KidProfile } from '../../types'
import { currentWorthHistory, firstBuyDate, firstTradeDate } from '../../lib/portfolio'
import { getAsset } from '../../data/universe'
import { money, percent, shortDate, niceDate } from '../../lib/format'
import { Card, SectionTitle } from '../common/ui'
import PriceChart from '../common/PriceChart'

// "Charts" — how the whole portfolio has grown, and each holding's price. Every
// chart starts on the day the child first invested, so it tells their real
// story from the beginning. The vertical axis auto-zooms so movement is easy to
// see (not a flat line filling the box).

export default function ChartsView({ kid, detailed }: { kid: KidProfile; detailed: boolean }) {
  const owned = kid.holdings.map((h) => h.ticker)
  const [ticker, setTicker] = useState<string>(owned[0] ?? '')

  const startDate = firstTradeDate(kid)
  const history = useMemo(() => currentWorthHistory(kid, startDate), [kid, startDate])
  const hasHoldings = kid.holdings.length > 0
  const enoughHistory = history.length >= 2

  const first = history[0]?.value ?? 0
  const last = history[history.length - 1]?.value ?? 0
  const change = last - first
  const changePct = first > 0 ? change / first : 0

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>Your investments over time</SectionTitle>
        {!hasHoldings ? (
          <p className="text-slate-400">
            You’re starting fresh with {money(kid.cash)}! Buy your first investment and this chart
            will show how it moves up and down over time.
          </p>
        ) : !enoughHistory ? (
          <p className="text-slate-400">
            Nice — you’ve made your first investment! This chart starts filling in from tomorrow, so
            check back to watch your money’s story unfold.
          </p>
        ) : (
          <>
            <div className="mb-2 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-extrabold text-ink">{money(last)}</span>
              <span className={`font-semibold ${change >= 0 ? 'text-up' : 'text-down'}`}>
                {change >= 0 ? '▲' : '▼'} {money(Math.abs(change))} ({percent(changePct)})
              </span>
              {startDate && (
                <span className="text-sm text-slate-500">since you started ({niceDate(startDate)})</span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={history} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="val" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5eead4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#5eead4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  minTickGap={40}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
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
                  stroke="#5eead4"
                  strokeWidth={3}
                  fill="url(#val)"
                  baseValue="dataMin"
                  name="What it's worth"
                />
              </AreaChart>
            </ResponsiveContainer>
            {detailed && (
              <p className="mt-1 text-center text-xs text-slate-400">
                <span className="text-mint">Mint</span> = what your investments are worth ·{' '}
                <span className="text-amber-500">dashed</span> = money you paid in
              </p>
            )}
          </>
        )}
      </Card>

      <Card>
        <SectionTitle>A closer look at one thing</SectionTitle>
        {owned.length === 0 ? (
          <p className="text-slate-400">Once you own something, its price chart shows up here.</p>
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
                      ticker === t ? 'bg-brand-600 text-white' : 'bg-white/10 text-brand-200'
                    }`}
                  >
                    {a?.emoji} {a?.name}
                  </button>
                )
              })}
            </div>
            <PriceChart ticker={ticker} since={firstBuyDate(kid, ticker)} />
          </>
        )}
      </Card>
    </div>
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
