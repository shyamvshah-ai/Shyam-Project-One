import type { Asset } from '../types'

// The curated, kid-friendly investable universe.
//
// Everything here is chosen to be RECOGNISABLE to a 10- and 13-year-old:
// brands they've heard of, and themes they can picture. Every entry has a
// short, plain-English blurb answering "what is this / why does it exist?".
//
// `source` is the real market symbol the price-refresh script fetches
// (Stooq style: ".us" = US listing, ".uk" = London). `seedPrice` is only an
// anchor for the shipped placeholder prices — real prices replace it.
//
// Prices everywhere in the app are in £ (the refresh script converts).

export const STOCKS: Asset[] = [
  {
    ticker: 'AAPL', source: 'aapl.us', name: 'Apple', kind: 'stock',
    sector: 'Technology', geography: 'USA', emoji: '🍎', seedPrice: 180,
    blurb: 'Makes the iPhone, iPad, Mac and AirPods. One of the biggest and most valuable companies in the world.',
    detail: { peRatio: 29, marketCapB: 2700, dividendYield: 0.005, revenueGrowth: 0.06 },
  },
  {
    ticker: 'AMZN', source: 'amzn.us', name: 'Amazon', kind: 'stock',
    sector: 'Shopping', geography: 'USA', emoji: '📦', seedPrice: 145,
    blurb: 'The giant online shop that delivers almost anything. Also runs huge computers that power much of the internet.',
    detail: { peRatio: 42, marketCapB: 1500, dividendYield: 0, revenueGrowth: 0.12 },
  },
  {
    ticker: 'MSFT', source: 'msft.us', name: 'Microsoft', kind: 'stock',
    sector: 'Technology', geography: 'USA', emoji: '🪟', seedPrice: 330,
    blurb: 'Makes Windows, Xbox, and Office. Also a leader in cloud computing and artificial intelligence.',
    detail: { peRatio: 35, marketCapB: 2500, dividendYield: 0.008, revenueGrowth: 0.15 },
  },
  {
    ticker: 'GOOGL', source: 'googl.us', name: 'Alphabet (Google)', kind: 'stock',
    sector: 'Technology', geography: 'USA', emoji: '🔍', seedPrice: 130,
    blurb: 'The company behind Google Search, YouTube and Android phones. Most of its money comes from adverts.',
    detail: { peRatio: 25, marketCapB: 1600, dividendYield: 0, revenueGrowth: 0.11 },
  },
  {
    ticker: 'NVDA', source: 'nvda.us', name: 'Nvidia', kind: 'stock',
    sector: 'Chips', geography: 'USA', emoji: '🎮', seedPrice: 95,
    blurb: 'Designs the powerful chips that run video games and, increasingly, artificial intelligence.',
    detail: { peRatio: 60, marketCapB: 1100, dividendYield: 0.001, revenueGrowth: 0.6 },
  },
  {
    ticker: 'TSLA', source: 'tsla.us', name: 'Tesla', kind: 'stock',
    sector: 'Cars', geography: 'USA', emoji: '🚗', seedPrice: 240,
    blurb: 'Makes electric cars and big batteries. Known for fast, techy vehicles and self-driving software.',
    detail: { peRatio: 70, marketCapB: 780, dividendYield: 0, revenueGrowth: 0.19 },
  },
  {
    ticker: 'DIS', source: 'dis.us', name: 'Disney', kind: 'stock',
    sector: 'Entertainment', geography: 'USA', emoji: '🏰', seedPrice: 90,
    blurb: 'Makes films and shows (Marvel, Star Wars, Pixar), runs theme parks, and owns the Disney+ streaming app.',
    detail: { peRatio: 22, marketCapB: 165, dividendYield: 0.008, revenueGrowth: 0.05 },
  },
  {
    ticker: 'NKE', source: 'nke.us', name: 'Nike', kind: 'stock',
    sector: 'Clothes & Shoes', geography: 'USA', emoji: '👟', seedPrice: 100,
    blurb: 'The world’s biggest maker of trainers and sportswear, famous for its "swoosh" tick logo.',
    detail: { peRatio: 28, marketCapB: 150, dividendYield: 0.014, revenueGrowth: 0.04 },
  },
  {
    ticker: 'SBUX', source: 'sbux.us', name: 'Starbucks', kind: 'stock',
    sector: 'Food & Drink', geography: 'USA', emoji: '☕', seedPrice: 95,
    blurb: 'The big coffee-shop chain you see on high streets everywhere, selling drinks and snacks.',
    detail: { peRatio: 24, marketCapB: 108, dividendYield: 0.024, revenueGrowth: 0.08 },
  },
  {
    ticker: 'MCD', source: 'mcd.us', name: "McDonald's", kind: 'stock',
    sector: 'Food & Drink', geography: 'USA', emoji: '🍟', seedPrice: 285,
    blurb: 'The world’s largest fast-food chain, selling burgers and fries in more than 100 countries.',
    detail: { peRatio: 25, marketCapB: 205, dividendYield: 0.023, revenueGrowth: 0.07 },
  },
  {
    ticker: 'KO', source: 'ko.us', name: 'Coca-Cola', kind: 'stock',
    sector: 'Food & Drink', geography: 'USA', emoji: '🥤', seedPrice: 60,
    blurb: 'Makes Coca-Cola and many other soft drinks sold all over the world. A very old, steady company.',
    detail: { peRatio: 24, marketCapB: 260, dividendYield: 0.031, revenueGrowth: 0.03 },
  },
  {
    ticker: 'NFLX', source: 'nflx.us', name: 'Netflix', kind: 'stock',
    sector: 'Entertainment', geography: 'USA', emoji: '🎬', seedPrice: 450,
    blurb: 'The streaming service with films and TV shows. It makes money from monthly subscriptions.',
    detail: { peRatio: 40, marketCapB: 200, dividendYield: 0, revenueGrowth: 0.13 },
  },
  {
    ticker: 'SPOT', source: 'spot.us', name: 'Spotify', kind: 'stock',
    sector: 'Entertainment', geography: 'Sweden', emoji: '🎧', seedPrice: 250,
    blurb: 'The music and podcast app. You pay monthly to listen without adverts.',
    detail: { peRatio: 90, marketCapB: 50, dividendYield: 0, revenueGrowth: 0.16 },
  },
  {
    ticker: 'NTDOY', source: 'ntdoy.us', name: 'Nintendo', kind: 'stock',
    sector: 'Toys & Games', geography: 'Japan', emoji: '🍄', seedPrice: 12,
    blurb: 'Makes the Switch console and games like Mario, Zelda and Pokémon.',
    detail: { peRatio: 18, marketCapB: 55, dividendYield: 0.028, revenueGrowth: 0.05 },
  },
  {
    ticker: 'SONY', source: 'sony.us', name: 'Sony', kind: 'stock',
    sector: 'Technology', geography: 'Japan', emoji: '🕹️', seedPrice: 90,
    blurb: 'Makes the PlayStation, cameras and headphones, and owns film and music studios too.',
    detail: { peRatio: 17, marketCapB: 110, dividendYield: 0.006, revenueGrowth: 0.06 },
  },
  {
    ticker: 'ASOS', source: 'asos.uk', name: 'ASOS', kind: 'stock',
    sector: 'Clothes & Shoes', geography: 'UK', emoji: '🛍️', seedPrice: 4,
    blurb: 'An online-only fashion shop from the UK, popular with teenagers for clothes and trainers.',
    detail: { peRatio: 0, marketCapB: 0.5, dividendYield: 0, revenueGrowth: -0.1 },
  },
  {
    ticker: 'BRBY', source: 'brby.uk', name: 'Burberry', kind: 'stock',
    sector: 'Luxury', geography: 'UK', emoji: '🧥', seedPrice: 11,
    blurb: 'A famous British luxury brand known for its checked-pattern coats and scarves.',
    detail: { peRatio: 16, marketCapB: 4, dividendYield: 0.04, revenueGrowth: -0.04 },
  },
  {
    ticker: 'TSCO', source: 'tsco.uk', name: 'Tesco', kind: 'stock',
    sector: 'Shopping', geography: 'UK', emoji: '🛒', seedPrice: 3,
    blurb: 'The biggest supermarket in the UK. A steady business — people always need food.',
    detail: { peRatio: 12, marketCapB: 20, dividendYield: 0.038, revenueGrowth: 0.06 },
  },
  {
    ticker: 'GAW', source: 'gaw.uk', name: 'Games Workshop', kind: 'stock',
    sector: 'Toys & Games', geography: 'UK', emoji: '🐉', seedPrice: 100,
    blurb: 'The British company that makes Warhammer miniatures — little models people paint and play with.',
    detail: { peRatio: 25, marketCapB: 3.5, dividendYield: 0.035, revenueGrowth: 0.1 },
  },
  {
    ticker: 'RR', source: 'rr.uk', name: 'Rolls-Royce', kind: 'stock',
    sector: 'Engineering', geography: 'UK', emoji: '✈️', seedPrice: 4,
    blurb: 'Builds the huge engines that power aeroplanes (not the cars — that’s a different company now).',
    detail: { peRatio: 20, marketCapB: 34, dividendYield: 0, revenueGrowth: 0.16 },
  },
  {
    ticker: 'ADDYY', source: 'addyy.us', name: 'Adidas', kind: 'stock',
    sector: 'Clothes & Shoes', geography: 'Germany', emoji: '🥅', seedPrice: 95,
    blurb: 'A German sportswear giant that makes trainers, football boots and kit — Nike’s biggest rival.',
    detail: { peRatio: 40, marketCapB: 35, dividendYield: 0.008, revenueGrowth: 0.05 },
  },
  {
    ticker: 'NSRGY', source: 'nsrgy.us', name: 'Nestlé', kind: 'stock',
    sector: 'Food & Drink', geography: 'Switzerland', emoji: '🍫', seedPrice: 100,
    blurb: 'A huge Swiss food company that makes KitKat, Nespresso, cereals and much more.',
    detail: { peRatio: 20, marketCapB: 250, dividendYield: 0.03, revenueGrowth: 0.02 },
  },
  {
    ticker: 'PG', source: 'pg.us', name: 'Procter & Gamble', kind: 'stock',
    sector: 'Everyday Products', geography: 'USA', emoji: '🧼', seedPrice: 150,
    blurb: 'Makes everyday household things like toothpaste, shampoo and washing powder (Gillette, Pampers, Fairy).',
    detail: { peRatio: 25, marketCapB: 350, dividendYield: 0.025, revenueGrowth: 0.03 },
  },
  {
    ticker: 'ABNB', source: 'abnb.us', name: 'Airbnb', kind: 'stock',
    sector: 'Travel', geography: 'USA', emoji: '🏠', seedPrice: 130,
    blurb: 'An app where people rent out their homes to travellers instead of using hotels.',
    detail: { peRatio: 45, marketCapB: 85, dividendYield: 0, revenueGrowth: 0.14 },
  },
  {
    ticker: 'UBER', source: 'uber.us', name: 'Uber', kind: 'stock',
    sector: 'Travel', geography: 'USA', emoji: '🚕', seedPrice: 55,
    blurb: 'The app you use to order a taxi ride or get food delivered (Uber Eats).',
    detail: { peRatio: 55, marketCapB: 115, dividendYield: 0, revenueGrowth: 0.17 },
  },
  {
    ticker: 'LULU', source: 'lulu.us', name: 'Lululemon', kind: 'stock',
    sector: 'Clothes & Shoes', geography: 'USA', emoji: '🧘', seedPrice: 380,
    blurb: 'Makes popular (and pricey) yoga and gym clothing, especially leggings.',
    detail: { peRatio: 30, marketCapB: 48, dividendYield: 0, revenueGrowth: 0.19 },
  },
  {
    ticker: 'MCDL', source: 'mar.us', name: 'Marriott Hotels', kind: 'stock',
    sector: 'Travel', geography: 'USA', emoji: '🛎️', seedPrice: 200,
    blurb: 'One of the world’s largest hotel companies, running thousands of hotels under many brands.',
    detail: { peRatio: 24, marketCapB: 62, dividendYield: 0.009, revenueGrowth: 0.06 },
  },
  {
    ticker: 'LEGOTOY', source: 'has.us', name: 'Hasbro', kind: 'stock',
    sector: 'Toys & Games', geography: 'USA', emoji: '🧸', seedPrice: 55,
    blurb: 'A big toy and games company behind Monopoly, Nerf, Play-Doh and Transformers.',
    detail: { peRatio: 18, marketCapB: 8, dividendYield: 0.045, revenueGrowth: -0.02 },
  },
  {
    ticker: 'SAMSUNG', source: 'samsung.kr', name: 'Samsung', kind: 'stock',
    sector: 'Technology', geography: 'South Korea', emoji: '📱', seedPrice: 45,
    blurb: 'A South Korean tech giant — makes Galaxy phones, TVs, and the memory chips inside loads of gadgets.',
    detail: { peRatio: 12, marketCapB: 300, dividendYield: 0.02, revenueGrowth: 0.05 },
  },
  {
    ticker: 'EZJ', source: 'ezj.uk', name: 'easyJet', kind: 'stock',
    sector: 'Travel', geography: 'UK', emoji: '🛫', seedPrice: 5,
    blurb: 'A low-cost airline that flies people around the UK and Europe on its bright orange planes.',
    detail: { peRatio: 10, marketCapB: 4, dividendYield: 0.02, revenueGrowth: 0.1 },
  },
  {
    ticker: 'SBRY', source: 'sbry.uk', name: "Sainsbury's", kind: 'stock',
    sector: 'Shopping', geography: 'UK', emoji: '🥫', seedPrice: 2.7,
    blurb: 'One of the UK’s biggest supermarkets, selling food, clothes (Tu) and homeware (Argos).',
    detail: { peRatio: 12, marketCapB: 7, dividendYield: 0.045, revenueGrowth: 0.04 },
  },
  {
    ticker: 'MKS', source: 'mks.uk', name: 'Marks & Spencer', kind: 'stock',
    sector: 'Shopping', geography: 'UK', emoji: '👗', seedPrice: 3.5,
    blurb: 'A classic British shop known for clothes, homeware and its popular M&S food halls.',
    detail: { peRatio: 11, marketCapB: 7, dividendYield: 0.02, revenueGrowth: 0.08 },
  },
]

export const ETFS: Asset[] = [
  {
    ticker: 'SP500', source: 'spy.us', name: 'S&P 500 (USA 500)', kind: 'etf',
    sector: 'Broad Market', geography: 'USA', emoji: '🇺🇸', seedPrice: 450,
    blurb: 'One click buys a tiny slice of the 500 biggest US companies at once. A classic "own everything" fund.',
    detail: { dividendYield: 0.014 },
  },
  {
    ticker: 'FTSE100', source: 'isf.uk', name: 'FTSE 100 (UK 100)', kind: 'etf',
    sector: 'Broad Market', geography: 'UK', emoji: '🇬🇧', seedPrice: 8,
    blurb: 'A slice of the 100 biggest companies listed in London — banks, oil, shops and more.',
    detail: { dividendYield: 0.038 },
  },
  {
    ticker: 'INDIA', source: 'inda.us', name: 'India', kind: 'etf',
    sector: 'Country', geography: 'India', emoji: '🇮🇳', seedPrice: 45,
    blurb: 'Invests in big Indian companies. India is a fast-growing country with lots of young people.',
    detail: { dividendYield: 0.01 },
  },
  {
    ticker: 'CHINA', source: 'mchi.us', name: 'China', kind: 'etf',
    sector: 'Country', geography: 'China', emoji: '🇨🇳', seedPrice: 40,
    blurb: 'Invests in large Chinese companies like tech and shopping giants. A big but bumpier market.',
    detail: { dividendYield: 0.02 },
  },
  {
    ticker: 'JAPAN', source: 'ewj.us', name: 'Japan', kind: 'etf',
    sector: 'Country', geography: 'Japan', emoji: '🇯🇵', seedPrice: 55,
    blurb: 'Invests in Japanese companies — carmakers, robotics and electronics firms.',
    detail: { dividendYield: 0.017 },
  },
  {
    ticker: 'EUROPE', source: 'vgk.us', name: 'Europe', kind: 'etf',
    sector: 'Region', geography: 'Europe', emoji: '🇪🇺', seedPrice: 60,
    blurb: 'A slice of big European companies — luxury brands, carmakers and banks.',
    detail: { dividendYield: 0.03 },
  },
  {
    ticker: 'LATAM', source: 'ilf.us', name: 'Latin America', kind: 'etf',
    sector: 'Region', geography: 'Latin America', emoji: '🌎', seedPrice: 20,
    blurb: 'Big companies from Latin America — countries like Brazil, Mexico and Chile.',
    detail: { dividendYield: 0.05 },
  },
  {
    ticker: 'AFRICA', source: 'afk.us', name: 'Africa', kind: 'etf',
    sector: 'Region', geography: 'Africa', emoji: '🌍', seedPrice: 15,
    blurb: 'Companies from across Africa — a young, fast-growing continent (mostly South Africa, Nigeria and Kenya).',
    detail: { dividendYield: 0.03 },
  },
  {
    ticker: 'SEMI', source: 'soxx.us', name: 'Semiconductors (Chips)', kind: 'etf',
    sector: 'Technology', geography: 'Global', emoji: '💾', seedPrice: 200,
    blurb: 'Owns lots of chip-making companies at once. Chips power phones, cars, games and AI.',
    detail: { dividendYield: 0.007 },
  },
  {
    ticker: 'ROBOTICS', source: 'robo.us', name: 'Robotics', kind: 'etf',
    sector: 'Technology', geography: 'Global', emoji: '🦾', seedPrice: 45,
    blurb: 'Companies that build robots and automation machines for factories, warehouses and hospitals.',
    detail: { dividendYield: 0.004 },
  },
  {
    ticker: 'AI', source: 'aiq.us', name: 'Artificial Intelligence', kind: 'etf',
    sector: 'Technology', geography: 'Global', emoji: '🤖', seedPrice: 30,
    blurb: 'Companies leading in artificial intelligence — the tech behind chatbots, self-driving cars and smart assistants.',
    detail: { dividendYield: 0.002 },
  },
  {
    ticker: 'CYBER', source: 'cibr.us', name: 'Cybersecurity', kind: 'etf',
    sector: 'Technology', geography: 'Global', emoji: '🛡️', seedPrice: 55,
    blurb: 'Companies that protect computers and the internet from hackers and viruses.',
    detail: { dividendYield: 0.003 },
  },
  {
    ticker: 'CLEAN', source: 'icln.us', name: 'Clean Energy', kind: 'etf',
    sector: 'Energy', geography: 'Global', emoji: '⚡', seedPrice: 14,
    blurb: 'Solar, wind and other green-energy companies. A bet that the world uses cleaner power over time.',
    detail: { dividendYield: 0.015 },
  },
  {
    ticker: 'AUTOS', source: 'carz.us', name: 'Cars & Electric Vehicles', kind: 'etf',
    sector: 'Cars', geography: 'Global', emoji: '🔋', seedPrice: 45,
    blurb: 'Carmakers around the world, including electric-vehicle companies. Rides the shift to EVs.',
    detail: { dividendYield: 0.018 },
  },
  {
    ticker: 'GAMING', source: 'espo.us', name: 'Video Games & Esports', kind: 'etf',
    sector: 'Toys & Games', geography: 'Global', emoji: '👾', seedPrice: 45,
    blurb: 'Companies that make video games and run esports competitions.',
    detail: { dividendYield: 0.006 },
  },
  {
    ticker: 'LUXURY', source: 'lux.us', name: 'Luxury Goods', kind: 'etf',
    sector: 'Luxury', geography: 'Global', emoji: '💎', seedPrice: 25,
    blurb: 'A fund of posh brands — designer fashion, watches and jewellery.',
    detail: { dividendYield: 0.012 },
  },
  {
    ticker: 'HEALTH', source: 'xlv.us', name: 'Healthcare', kind: 'etf',
    sector: 'Healthcare', geography: 'USA', emoji: '🩺', seedPrice: 135,
    blurb: 'Companies that make medicines and medical kit. People always need healthcare, so it’s fairly steady.',
    detail: { dividendYield: 0.015 },
  },
  {
    ticker: 'GOLD', source: 'gld.us', name: 'Gold', kind: 'etf',
    sector: 'Commodity', geography: 'Global', emoji: '🥇', seedPrice: 175,
    blurb: 'Tracks the price of gold. People often buy it when they’re nervous about other investments.',
    detail: { dividendYield: 0 },
  },
  {
    ticker: 'SPACE', source: 'ufo.us', name: 'Space', kind: 'etf',
    sector: 'Space', geography: 'Global', emoji: '🚀', seedPrice: 25,
    blurb: 'Companies building rockets, satellites and space technology.',
    detail: { dividendYield: 0.008 },
  },
  {
    ticker: 'DEFENCE', source: 'ita.us', name: 'Defence', kind: 'etf',
    sector: 'Defence', geography: 'USA', emoji: '🛩️', seedPrice: 110,
    blurb: 'Companies that make aircraft, ships and equipment for a country’s armed forces.',
    detail: { dividendYield: 0.01 },
  },
]

export const UNIVERSE: Asset[] = [...STOCKS, ...ETFS]

/** Fast lookup by ticker. */
export const ASSET_BY_TICKER: Record<string, Asset> = Object.fromEntries(
  UNIVERSE.map((a) => [a.ticker, a]),
)

export function getAsset(ticker: string): Asset | undefined {
  return ASSET_BY_TICKER[ticker]
}
