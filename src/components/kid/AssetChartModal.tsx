import { useState } from 'react'
import type { Asset, TradeAction } from '../../types'
import { dailyChange, latestPrice, localPrice } from '../../lib/prices'
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
  const day = dailyChange(asset.ticker)

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-night-800 p-5 text-ink shadow-2xl ring-1 ring-white/10 sm:rounded-3xl"
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
          <GainPill amount={day.change} pct={day.pct} simple={!detailed} size="sm" />
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
