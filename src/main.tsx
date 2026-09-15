import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted so the canvas export never races a font CDN.
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import '@fontsource/merriweather/400.css'
import '@fontsource/merriweather/900.css'

import './index.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
