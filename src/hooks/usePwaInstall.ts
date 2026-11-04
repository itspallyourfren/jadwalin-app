// src/hooks/usePwaInstall.ts - React Hook for Native PWA Installation
import { useEffect, useState } from 'react'
import {
  canPromptPwaInstall,
  isAppInstalled,
  promptPwaInstall,
  subscribePwaInstall,
} from '../lib/pwaInstallService'

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(canPromptPwaInstall())
  const [isInstalled, setIsInstalled] = useState<boolean>(isAppInstalled())

  useEffect(() => {
    setIsInstalled(isAppInstalled())
    const unsubscribe = subscribePwaInstall((can) => {
      setCanInstall(can)
      setIsInstalled(isAppInstalled())
    })
    return unsubscribe
  }, [])

  return {
    canInstall,
    isInstalled,
    installApp: promptPwaInstall,
  }
}
