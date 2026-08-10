import { useId, useState } from 'react'
import { lookupJargon } from './jargon'

// A word with a friendly dotted underline. Tap or hover to see a kid-friendly
// explanation. This is the app's "education layer" glue — wrap any jargon in it.
//
//   <Jargon k="p/e ratio">P/E</Jargon>

interface Props {
  /** Dictionary key (defaults to the visible text, lower-cased). */
  k?: string
  children: React.ReactNode
}

export default function Jargon({ k, children }: Props) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const key = k ?? (typeof children === 'string' ? children : '')
  const entry = lookupJargon(key)
  if (!entry) return <>{children}</>

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="cursor-help border-b-2 border-dotted border-brand-400 font-semibold text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        {children}
        <span aria-hidden className="ml-0.5 text-brand-400">
          ⓘ
        </span>
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-2xl bg-indigo-950 p-3 text-left text-sm font-medium leading-snug text-white shadow-xl"
        >
          <span className="mb-1 block font-bold text-brand-200">{entry.term}</span>
          {entry.short}
        </span>
      )}
    </span>
  )
}
