// The app's logo: a small rounded tile with an upward line-chart glyph, in the
// mint→violet accent. Cleaner and less childish than an emoji.

export default function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-grid flex-none place-items-center rounded-[28%] bg-gradient-to-br from-mint to-brand-500 shadow-[0_4px_14px_-4px_rgba(94,234,212,0.55)]"
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.64}
        height={size * 0.64}
        fill="none"
        stroke="#0b0f1e"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="3,16 9,10 13,13 21,5" />
        <polyline points="15,5 21,5 21,11" />
      </svg>
    </span>
  )
}
