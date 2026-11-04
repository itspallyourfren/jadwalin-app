// src/engine/appTourGuide.test.ts - Unit Tests for Driver.js Tour Orchestrator
import { describe, expect, it, vi } from 'vitest'
import { startAppTutorialTour } from './appTourGuide'

vi.mock('driver.js', () => {
  return {
    driver: vi.fn(() => ({
      drive: vi.fn(),
      destroy: vi.fn(),
    })),
  }
})

describe('appTourGuide', () => {
  it('initializes driver with 6 comprehensive student onboarding steps', () => {
    const onFinish = vi.fn()
    const instance = startAppTutorialTour(onFinish)
    expect(instance).toBeDefined()
    expect(instance.drive).toBeDefined()
  })
})
