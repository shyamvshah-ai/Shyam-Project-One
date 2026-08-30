import { useState } from 'react'
import type { Asset, TradeAction } from '../../types'
import { latestPrice, localPrice, priceHistory } from '../../lib/prices'
import { moneyExact, localMoney } from '../../lib/format'
import { GainPill } from '../common/ui'
import CompanyLogo from '../common/CompanyLogo'
import PriceChart, { RANGES } from '../common/PriceChart'

// A pop-up showing an asset's full historical price chart, opened by tapping the
// mini-chart on an Explore card. Works for anything, owned or not.

export default function AssetChartModal({
  asset,
  detailed,
  onClose,
  onTrade,
}: {
  asset: Asset
  detailed: boolean
  onClose: () => void
  onTrade: (asset: Asset, action: TradeAction) => void
}) {
  const [rangeIdx, setRangeIdx] = useState(3) // default 1Y
  const price = latestPrice(asset.ticker) ?? 0
  const local = localPrice(asset.ticker)

  // The change shown matches the chart's window: first point → latest, over the
  // selected range. So picking "5Y" shows the 5-year move, "1M" the month, etc.
  const range = RANGES[rangeIdx]
  const series = priceHistory(asset.ticker, range.days || undefined)
  const startPrice = series.length ? series[0].price : price
  const rangeChange = series.length ? series[series.length - 1].price - startPrice : 0
  const rangePct = startPrice ? rangeChange / startPrice : 0
  const periodLabel = range.label === 'All' ? 'all time' : `past ${range.label}`

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-night-800 p-5 text-ink shadow-2xl ring-1 ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start gap-3">
          <CompanyLogo asset={asset} size={44} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold text-ink">{asset.name}</div>
            <div className="text-xs text-slate-400">
              {asset.kind === 'etf' ? '🧺 Basket' : '🏢 Company'} · {asset.sector} · {asset.geography}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 shrink-0 rounded-full bg-white/5 text-lg font-bold text-slate-400"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-extrabold text-ink">{moneyExact(price)}</span>
          {local && local.currency !== 'GBP' && (
            <span className="text-sm font-semibold text-slate-400">
              {localMoney(local.currency, local.price)}
            </span>
          )}
          <GainPill amount={rangeChange} pct={rangePct} simple={!detailed} size="sm" />
          <span className="text-xs font-semibold text-slate-400">{periodLabel}</span>
        </div>

        <div className="mb-2 flex gap-1">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                rangeIdx === i ? 'bg-indigo-900 text-white' : 'bg-white/5 text-slate-400'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <PriceChart ticker={asset.ticker} days={RANGES[rangeIdx].days} height={220} />

        <p className="mt-2 rounded-2xl bg-white/10 p-3 text-sm text-brand-200">{asset.blurb}</p>

        <div className="mt-3 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Close
          </button>
          <button
            onClick={() => {
              onTrade(asset, 'buy')
              onClose()
            }}
            className="btn-primary flex-1"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  )
}
