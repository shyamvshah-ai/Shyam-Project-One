import type { ReactNode } from 'react'
import { moneySigned, percent } from '../../lib/format'
import type { PricePoint } from '../../lib/prices'

// Small, reusable presentational bits shared across views.

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`card p-4 sm:p-5 ${className}`} style={style}>
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-lg font-extrabold text-indigo-900 sm:text-xl">{children}</h2>
}

/** Green/red colour classes for up/down/flat. */
export function toneClasses(n: number): { text: string; bg: string } {
  if (n > 0) return { text: 'text-up', bg: 'bg-up-soft' }
  if (n < 0) return { text: 'text-down', bg: 'bg-down-soft' }
  return { text: 'text-slate-500', bg: 'bg-slate-100' }
}

export function arrow(n: number): string {
  return n > 0 ? '▲' : n < 0 ? '▼' : '＝'
}

/**
 * A coloured pill showing a gain/loss. `simple` hides the % for the youngest
 * users and keeps just the friendly arrow + £.
 */
export function GainPill({
  amount,
  pct,
  simple = false,
  size = 'md',
}: {
  amount: number
  pct?: number
  simple?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const tone = toneClasses(amount)
  const sizeCls =
    size === 'lg' ? 'text-lg px-4 py-1.5' : size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm'
  return (
    <span className={`pill ${tone.bg} ${tone.text} ${sizeCls}`}>
      <span aria-hidden>{arrow(amount)}</span>
      {moneySigned(amount)}
      {!simple && pct !== undefined && <span className="opacity-75">({percent(pct)})</span>}
    </span>
  )
}

/** A tiny inline line chart for a price series. Pure SVG — no library needed. */
export function Sparkline({
  points,
  width = 120,
  height = 36,
}: {
  points: PricePoint[]
  width?: number
  height?: number
}) {
  if (points.length < 2) return <div style={{ width, height }} />
  const prices = points.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const stepX = width / (points.length - 1)
  const d = points
    .map((p, i) => {
      const x = i * stepX
      const y = height - ((p.price - min) / range) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const rising = prices[prices.length - 1] >= prices[0]
  const colour = rising ? '#16a34a' : '#dc2626'
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={d} fill="none" stroke={colour} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
