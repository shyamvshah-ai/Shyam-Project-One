import { useState } from 'react'
import type { Asset } from '../../types'

// Shows a company's real logo, falling back to the friendly emoji if the logo
// can't be loaded (ETFs have no company logo; the backup claude.ai link blocks
// external images; a provider might be down). Logos are fetched by domain from
// free logo services — no API key.

// Real-world domains for the companies in the universe. ETFs are intentionally
// omitted: a "basket" isn't a single company, so it keeps its themed emoji.
const DOMAINS: Record<string, string> = {
  AAPL: 'apple.com',
  AMZN: 'amazon.com',
  MSFT: 'microsoft.com',
  GOOGL: 'google.com',
  NVDA: 'nvidia.com',
  TSLA: 'tesla.com',
  DIS: 'disney.com',
  NKE: 'nike.com',
  SBUX: 'starbucks.com',
  MCD: 'mcdonalds.com',
  KO: 'coca-cola.com',
  NFLX: 'netflix.com',
  SPOT: 'spotify.com',
  NTDOY: 'nintendo.com',
  SONY: 'sony.com',
  ASOS: 'asos.com',
  BRBY: 'burberry.com',
  TSCO: 'tesco.com',
  GAW: 'games-workshop.com',
  RR: 'rolls-royce.com',
  ADDYY: 'adidas.com',
  NSRGY: 'nestle.com',
  PG: 'pg.com',
  ABNB: 'airbnb.com',
  UBER: 'uber.com',
  LULU: 'lululemon.com',
  MCDL: 'marriott.com',
  LEGOTOY: 'hasbro.com',
  SAMSUNG: 'samsung.com',
  EZJ: 'easyjet.com',
  SBRY: 'sainsburys.co.uk',
  MKS: 'marksandspencer.com',
  RBLX: 'roblox.com',
  CROX: 'crocs.com',
  RACE: 'ferrari.com',
  MAT: 'mattel.com',
  DUOL: 'duolingo.com',
}

// Try a real logo first, then a favicon service, then give up (→ emoji).
const SOURCES: ((domain: string) => string)[] = [
  (d) => `https://logo.clearbit.com/${d}`,
  (d) => `https://icons.duckduckgo.com/ip3/${d}.ico`,
]

export default function CompanyLogo({
  asset,
  size = 36,
}: {
  asset: Asset
  size?: number
}) {
  const domain = DOMAINS[asset.ticker]
  const [srcIdx, setSrcIdx] = useState(0)

  const box = {
    width: size,
    height: size,
  } as const

  // No domain (ETF) or every source failed → friendly emoji.
  if (!domain || srcIdx >= SOURCES.length) {
    return (
      <span
        style={{ ...box, fontSize: Math.round(size * 0.62) }}
        className="grid flex-none place-items-center rounded-xl bg-white/5"
        aria-hidden
      >
        {asset.emoji}
      </span>
    )
  }

  return (
    <span
      style={box}
      className="grid flex-none place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-white/10"
    >
      <img
        src={SOURCES[srcIdx](domain)}
        onError={() => setSrcIdx((i) => i + 1)}
        alt={asset.name}
        loading="lazy"
        style={{ maxWidth: '82%', maxHeight: '82%' }}
        className="object-contain"
      />
    </span>
  )
}
