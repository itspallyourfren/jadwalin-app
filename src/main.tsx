import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initPwaInstallListener } from './lib/pwaInstallService'

// Initialize Service Worker & PWA Install Prompter
initPwaInstallListener()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
