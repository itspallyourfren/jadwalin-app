// src/lib/pwaInstallService.test.ts - Unit Tests for PWA Installation Service
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  canPromptPwaInstall,
  initPwaInstallListener,
  isAppInstalled,
  promptPwaInstall,
  subscribePwaInstall,
} from './pwaInstallService'

describe('pwaInstallService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('detects when app is not installed', () => {
    expect(isAppInstalled()).toBe(false)
  })

  it('handles promptPwaInstall when unsupported or without event gracefully', async () => {
    const result = await promptPwaInstall()
    expect(result).toBe('unsupported')
  })

  it('allows subscribing to install state changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribePwaInstall(listener)
    expect(listener).toHaveBeenCalledWith(false)
    unsubscribe()
  })

  it('registers window events without error on init', () => {
    expect(() => initPwaInstallListener()).not.toThrow()
  })
})
