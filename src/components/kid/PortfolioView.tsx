import type { Asset, KidProfile, TradeAction } from '../../types'
import { portfolioSummary, firstBuyDate, type HoldingView } from '../../lib/portfolio'
import { getAsset } from '../../data/universe'
import { priceHistory, priceHistorySince } from '../../lib/prices'
import { money, moneyExact, moneySigned, percent, shares as fmtShares } from '../../lib/format'
import { Card, GainPill, MiniChart, toneClasses } from '../common/ui'
import Jargon from '../common/Jargon'
import CompanyLogo from '../common/CompanyLogo'

// "My Money" — the child's home screen. Big total, clear up/down colour, and a
// tappable list of what they own.

export default function PortfolioView({
  kid,
  detailed,
  onTrade,
}: {
  kid: KidProfile
  detailed: boolean
  onTrade: (asset: Asset, action: TradeAction) => void
}) {
  const p = portfolioSummary(kid)
  const tone = toneClasses(p.totalGain)

  return (
    <div className="space-y-4">
      {/* Hero: total worth */}
      <Card className="text-center">
        <div className="text-sm font-bold uppercase tracking-wide text-slate-400">
          {kid.name}’s money is worth
        </div>
        <div className="my-1 text-5xl font-extrabold text-ink sm:text-6xl">
          {money(p.totalValue)}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <GainPill amount={p.totalGain} pct={p.totalGainPct} simple={!detailed} size="lg" />
          <span className={`text-sm font-semibold ${tone.text}`}>
            {p.totalGain >= 0 ? 'up' : 'down'} since you started
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniStat label="Spending cash" value={moneyExact(p.cash)} emoji="👛" jargon="cash" />
          <MiniStat
            label="This week’s change"
            value={moneySigned(p.weekChange)}
            emoji={p.weekChange >= 0 ? '📈' : '📉'}
            tone={p.weekChange}
          />
          {detailed && (
            <MiniStat label="Money paid in" value={money(p.totalDeposited)} emoji="🐷" />
          )}
        </div>
      </Card>

      {/* Holdings */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold text-ink">
            What {kid.name} owns{' '}
            <span className="text-slate-500">({p.holdings.length})</span>
          </h2>
        </div>

        {p.holdings.length === 0 ? (
          <Card className="text-center text-slate-400">
            Nothing yet! Tap <strong>🔭 Explore</strong> to find your first company or fund to
            invest in.
          </Card>
        ) : (
          <div className="space-y-2">
            {p.holdings
              .slice()
              .sort((a, b) => b.value - a.value)
              .map((h) => (
                <HoldingRow
                  key={h.ticker}
                  kid={kid}
                  view={h}
                  totalValue={p.holdingsValue}
                  detailed={detailed}
                  onTrade={onTrade}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  emoji,
  tone,
  jargon,
}: {
  label: string
  value: string
  emoji: string
  tone?: number
  jargon?: string
}) {
  const toneCls = tone === undefined ? 'text-ink' : toneClasses(tone).text
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-2 text-center">
      <div className="text-xs font-semibold text-slate-400">
        {emoji} {jargon ? <Jargon k={jargon}>{label}</Jargon> : label}
      </div>
      <div className={`text-lg font-extrabold ${toneCls}`}>{value}</div>
    </div>
  )
}

function HoldingRow({
  kid,
  view,
  totalValue,
  detailed,
  onTrade,
}: {
  kid: KidProfile
  view: HoldingView
  totalValue: number
  detailed: boolean
  onTrade: (asset: Asset, action: TradeAction) => void
}) {
  const asset = getAsset(view.ticker)
  if (!asset) return null
  const weight = totalValue > 0 ? view.value / totalValue : 0
  // The holding's price since the day it was first bought (their own story).
  const since = firstBuyDate(kid, view.ticker)
  const points = since ? priceHistorySince(view.ticker, since) : priceHistory(view.ticker, 60)

  return (
    <Card className="!p-3">
      <div className="flex items-center gap-3">
        <CompanyLogo asset={asset} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-extrabold text-ink">{asset.name}</span>
            {detailed && (
              <span className="shrink-0 text-xs text-slate-500">
                {fmtShares(view.shares)} × {moneyExact(view.price)}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-lg font-extrabold text-ink">{money(view.value)}</span>
            <GainPill amount={view.gain} pct={view.gainPct} simple={!detailed} size="sm" />
          </div>
          {detailed && (
            <div className="mt-0.5 text-xs text-slate-400">
              <Jargon k="average cost">Avg cost</Jargon> {moneyExact(view.avgCost)} ·{' '}
              {percent(weight, 0)} of portfolio
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <button className="btn-primary !px-3 !py-1 text-sm" onClick={() => onTrade(asset, 'buy')}>
            Buy
          </button>
          <button
            className="btn-ghost !px-3 !py-1 text-sm"
            onClick={() => onTrade(asset, 'sell')}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Chart tile — this holding's price since the child bought it. */}
      <div className="mt-3">
        <MiniChart points={points} />
      </div>
    </Card>
  )
}
