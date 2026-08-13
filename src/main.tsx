import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Sora — a clean, modern web font. Self-hosted (bundled) so it works on the
// hosted site and offline, with no external requests.
import '@fontsource/sora/latin-400.css'
import '@fontsource/sora/latin-500.css'
import '@fontsource/sora/latin-600.css'
import '@fontsource/sora/latin-700.css'
import '@fontsource/sora/latin-800.css'
import './index.css'
import App from './App'
import { StoreProvider } from './state/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
