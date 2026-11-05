// src/lib/cloudSyncService.test.ts - Unit Tests for Cloudflare Edge Vault Sync
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cancelScheduledCloudSync,
  pullBackupFromCloud,
  pushBackupToCloud,
  scheduleDebouncedCloudSync,
} from './cloudSyncService'
import type { MobileBackupPayload } from '../data/types'

const stubPayload: MobileBackupPayload = {
  version: 1,
  exportedAtIso: new Date().toISOString(),
  participantName: 'Budi',
  characterId: 'CHR-01',
  tasks: [],
  completedDates: ['2026-11-05'],
  reminderConfig: {
    morningSummaryTime: '07:30',
    nightReviewTime: '21:00',
    streakProtectionAlert: true,
    interleavingSuggestions: true,
  },
  gameCommitment: null,
  activeBoardView: 'KANBAN',
  soundEnabled: true,
}

describe('cloudSyncService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    cancelScheduledCloudSync()
  })

  it('pushes backup data to /api/sync successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        syncCode: 'JDW-TEST',
        updatedAtIso: '2026-11-05T10:00:00.000Z',
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await pushBackupToCloud(stubPayload, 'Budi', null)
    expect(res.success).toBe(true)
    expect(res.syncCode).toBe('JDW-TEST')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sync',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('handles push error gracefully when network fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error'))
    )

    const res = await pushBackupToCloud(stubPayload, 'Budi')
    expect(res.success).toBe(false)
    expect(res.error).toContain('Network error')
  })

  it('pulls backup from cloud with valid code', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        syncCode: 'JDW-TEST',
        payload: stubPayload,
        updatedAtIso: '2026-11-05T10:00:00.000Z',
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await pullBackupFromCloud('JDW-TEST')
    expect(res.success).toBe(true)
    expect(res.payload?.participantName).toBe('Budi')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sync?code=JDW-TEST',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('debounces auto-sync calls to prevent request flooding', () => {
    vi.useFakeTimers()
    const onSync = vi.fn()

    scheduleDebouncedCloudSync(onSync, 1000)
    scheduleDebouncedCloudSync(onSync, 1000)
    scheduleDebouncedCloudSync(onSync, 1000)

    expect(onSync).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(onSync).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})
