// src/lib/pwaInstallService.ts - Service Worker Registration & Native PWA WebAPK Prompt
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<(canInstall: boolean) => void>()

export function initPwaInstallListener(): void {
  if (typeof window === 'undefined') return

  // Register Service Worker in production
  if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.hostname !== 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          // If a new SW is waiting, skip waiting immediately
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err)
        })
    })
  }

  // Capture the native Chrome Android WebAPK beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    listeners.forEach((listener) => listener(true))
  })

  // Detect when installation finishes
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    listeners.forEach((listener) => listener(false))
  })
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  )
}

export function canPromptPwaInstall(): boolean {
  return deferredPrompt !== null && !isAppInstalled()
}

export async function promptPwaInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
  if (!deferredPrompt) {
    return 'unsupported'
  }
  try {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      deferredPrompt = null
      listeners.forEach((listener) => listener(false))
    }
    return outcome
  } catch {
    return 'dismissed'
  }
}

export function subscribePwaInstall(callback: (canInstall: boolean) => void): () => void {
  listeners.add(callback)
  callback(canPromptPwaInstall())
  return () => {
    listeners.delete(callback)
  }
}
