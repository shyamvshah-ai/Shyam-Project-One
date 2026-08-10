// Plain-English explanations of investing jargon, written for a 10–13 year old.
// Used by the <Jargon> tooltip so every number can teach something.

export interface JargonEntry {
  term: string
  short: string
}

export const JARGON: Record<string, JargonEntry> = {
  share: {
    term: 'Share',
    short:
      'A tiny piece of a company. If you own a share, you own a little slice of that business.',
  },
  stock: {
    term: 'Stock',
    short: 'Another word for shares in a company — a slice of one business.',
  },
  etf: {
    term: 'ETF',
    short:
      'A basket that holds lots of companies at once. Buying one share of the basket spreads your money out.',
  },
  portfolio: {
    term: 'Portfolio',
    short: 'All of your investments added together — everything you own.',
  },
  'gain/loss': {
    term: 'Gain / Loss',
    short:
      'How much your money has grown (gain) or shrunk (loss) since you bought — shown in £ and %.',
  },
  dividend: {
    term: 'Dividend',
    short:
      'Some companies share their profits by paying owners a little cash. That payment is a dividend.',
  },
  'dividend yield': {
    term: 'Dividend yield',
    short:
      'How much a company pays out each year as a % of its price. 3% means about £3 a year for every £100 you invest.',
  },
  'p/e ratio': {
    term: 'P/E ratio',
    short:
      "Price ÷ profits. Roughly how many years of today's profit you're paying for. High can mean people expect fast growth.",
  },
  'market cap': {
    term: 'Market cap',
    short:
      'The total value of a whole company — the price of one share times the number of shares. Tells you how big it is.',
  },
  'revenue growth': {
    term: 'Revenue growth',
    short: 'How much more money the company is bringing in than a year ago. Higher usually means it’s growing.',
  },
  volatility: {
    term: 'Volatility',
    short: 'How bumpy the price is. Very bumpy (volatile) prices can jump up and down a lot.',
  },
  diversification: {
    term: 'Diversification',
    short:
      'Not putting all your eggs in one basket — spreading money across different companies so one bad day hurts less.',
  },
  cash: {
    term: 'Cash',
    short: 'Money you haven’t invested yet, waiting to be used to buy shares.',
  },
  'average cost': {
    term: 'Average cost',
    short: 'The typical price you paid per share, blending all your buys together.',
  },
}

export function lookupJargon(key: string): JargonEntry | undefined {
  return JARGON[key.toLowerCase()]
}
