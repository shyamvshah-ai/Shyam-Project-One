import { useMemo, useState } from 'react'
import type { Asset, KidProfile, TradeAction } from '../../types'
import { UNIVERSE } from '../../data/universe'
import { dailyChange, hasPrices, latestPrice, localPrice, priceHistory } from '../../lib/prices'
import { localMoney, moneyExact, percent } from '../../lib/format'
import { Card, GainPill, Sparkline } from '../common/ui'
import Jargon from '../common/Jargon'
import CompanyLogo from '../common/CompanyLogo'
import AssetChartModal from './AssetChartModal'

// "Explore" — browse the curated, kid-friendly universe. Every card explains in
// plain English what the company or fund actually is.

type Filter = 'all' | 'stock' | 'etf'

export default function ExploreView({
  kid,
  detailed,
  onTrade,
}: {
  kid: KidProfile
  detailed: boolean
  onTrade: (asset: Asset, action: TradeAction) => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [chartAsset, setChartAsset] = useState<Asset | null>(null)
  const owned = new Set(kid.holdings.map((h) => h.ticker))

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return UNIVERSE.filter(hasPricesAsset)
      .filter((a) => (filter === 'all' ? true : a.kind === filter))
      .filter(
        (a) =>
          q === '' ||
          a.name.toLowerCase().includes(q) ||
          a.sector.toLowerCase().includes(q) ||
          a.geography.toLowerCase().includes(q),
      )
  }, [filter, query])

  return (
    <div className="space-y-4">
      {/* relative z-40 keeps the jargon tooltips above the asset cards below,
          which create their own stacking layers via their blur backdrop. */}
      <Card className="relative z-40 !p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search names, sectors or places…"
          className="mb-2 w-full rounded-2xl border-2 border-white/10 px-3 py-2 text-ink focus:border-brand-400 focus:outline-none"
        />
        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={filter === 'stock'} onClick={() => setFilter('stock')}>
            🏢 <Jargon k="stock">Companies</Jargon>
          </FilterButton>
          <FilterButton active={filter === 'etf'} onClick={() => setFilter('etf')}>
            🧺 <Jargon k="etf">Baskets</Jargon>
          </FilterButton>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((a) => (
          <AssetCard
            key={a.ticker}
            asset={a}
            detailed={detailed}
            owned={owned.has(a.ticker)}
            onTrade={onTrade}
            onOpenChart={setChartAsset}
          />
        ))}
      </div>
      {list.length === 0 && (
        <Card className="text-center text-slate-400">No matches — try a different search.</Card>
      )}

      {chartAsset && (
        <AssetChartModal
          asset={chartAsset}
          detailed={detailed}
          onClose={() => setChartAsset(null)}
          onTrade={onTrade}
        />
      )}
    </div>
  )
}

function hasPricesAsset(a: Asset): boolean {
  return hasPrices(a.ticker)
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1.5 text-sm font-bold transition ${
        active ? 'bg-brand-600 text-white' : 'bg-white/10 text-brand-200'
      }`}
    >
      {children}
    </button>
  )
}

function AssetCard({
  asset,
  detailed,
  owned,
  onTrade,
  onOpenChart,
}: {
  asset: Asset
  detailed: boolean
  owned: boolean
  onTrade: (asset: Asset, action: TradeAction) => void
  onOpenChart: (asset: Asset) => void
}) {
  const price = latestPrice(asset.ticker) ?? 0
  const local = localPrice(asset.ticker)
  const day = dailyChange(asset.ticker)

  return (
    <Card className="flex flex-col">
      <div className="flex items-start gap-3">
        <CompanyLogo asset={asset} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-extrabold text-ink">{asset.name}</span>
            {owned && <span className="pill bg-up-soft text-up !px-2 !py-0 text-[10px]">owned</span>}
          </div>
          <div className="text-xs text-slate-400">
            {asset.kind === 'etf' ? '🧺 Basket' : '🏢 Company'} · {asset.sector} · {asset.geography}
          </div>
        </div>
        {/* Tap the mini-chart to open the full history. */}
        <button
          onClick={() => onOpenChart(asset)}
          className="group flex flex-col items-center rounded-xl p-1 transition hover:bg-white/10"
          aria-label={`See ${asset.name} price history`}
          title="Tap to see the price chart"
        >
          <Sparkline points={priceHistory(asset.ticker, 60)} width={64} height={28} />
          <span className="text-[10px] font-semibold text-brand-400 group-hover:text-mint">
            📈 chart
          </span>
        </button>
      </div>

      <p className="mt-2 text-sm text-slate-300">{asset.blurb}</p>

      {detailed && asset.detail && <DetailFacts asset={asset} />}

      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-ink">{moneyExact(price)}</span>
            {local && local.currency !== 'GBP' && (
              <span className="text-xs font-semibold text-slate-400">
                {localMoney(local.currency, local.price)}
              </span>
            )}
          </div>
          <GainPill amount={day.change} pct={day.pct} simple={!detailed} size="sm" />
        </div>
        <button className="btn-primary" onClick={() => onTrade(asset, 'buy')}>
          Buy
        </button>
      </div>
    </Card>
  )
}

// Leila's "detailed" facts, each with a tap-to-learn tooltip.
function DetailFacts({ asset }: { asset: Asset }) {
  const d = asset.detail!
  const facts: { label: string; jargon: string; value: string }[] = []
  if (d.peRatio !== undefined && d.peRatio > 0)
    facts.push({ label: 'P/E', jargon: 'p/e ratio', value: d.peRatio.toFixed(0) })
  if (d.marketCapB !== undefined && d.marketCapB > 0)
    facts.push({ label: 'Size', jargon: 'market cap', value: `£${fmtBn(d.marketCapB)}` })
  if (d.dividendYield !== undefined)
    facts.push({
      label: 'Dividend',
      jargon: 'dividend yield',
      value: d.dividendYield > 0 ? percent(d.dividendYield, 1).replace('+', '') : 'none',
    })
  if (d.revenueGrowth !== undefined)
    facts.push({ label: 'Growth', jargon: 'revenue growth', value: percent(d.revenueGrowth, 0) })

  if (facts.length === 0) return null
  return (
    <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-2xl bg-white/5 p-2 text-xs">
      {facts.map((f) => (
        <div key={f.label} className="flex items-center justify-between gap-1">
          <Jargon k={f.jargon}>
            <span className="text-slate-400">{f.label}</span>
          </Jargon>
          <span className="font-bold text-ink">{f.value}</span>
        </div>
      ))}
    </div>
  )
}

function fmtBn(b: number): string {
  if (b >= 1000) return `${(b / 1000).toFixed(1)}tn`
  if (b >= 1) return `${b.toFixed(0)}bn`
  return `${(b * 1000).toFixed(0)}m`
}
