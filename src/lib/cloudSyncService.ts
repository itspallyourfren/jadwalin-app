// src/lib/cloudSyncService.ts - Client Service for Cloudflare Edge Vault Sync
import type { MobileBackupPayload } from '../data/types'

export interface CloudSyncPushResponse {
  success: boolean
  syncCode?: string
  participantName?: string
  updatedAtIso?: string
  storageType?: string
  message?: string
  error?: string
}

export interface CloudSyncPullResponse {
  success: boolean
  syncCode?: string
  participantName?: string
  payload?: MobileBackupPayload
  updatedAtIso?: string
  error?: string
}

const API_BASE = '/api/sync'

export async function pushBackupToCloud(
  payload: MobileBackupPayload,
  participantName: string,
  existingSyncCode?: string | null
): Promise<CloudSyncPushResponse> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        syncCode: existingSyncCode?.trim() || undefined,
        participantName,
        payload,
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || `Gagal menyimpan ke cloud (${res.status})`,
      }
    }

    return {
      success: true,
      syncCode: data.syncCode,
      participantName: data.participantName,
      updatedAtIso: data.updatedAtIso,
      storageType: data.storageType,
      message: data.message,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Koneksi ke Cloudflare API gagal atau sedang offline.',
    }
  }
}

export async function pullBackupFromCloud(
  rawSyncCode: string
): Promise<CloudSyncPullResponse> {
  const code = rawSyncCode.trim().toUpperCase()
  if (!code) {
    return { success: false, error: 'Kode sinkronisasi tidak boleh kosong.' }
  }

  try {
    const res = await fetch(`${API_BASE}?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || `Kode "${code}" tidak ditemukan di Cloudflare Vault.`,
      }
    }

    return {
      success: true,
      syncCode: data.syncCode,
      participantName: data.participantName,
      payload: data.payload,
      updatedAtIso: data.updatedAtIso,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Gagal menghubungi Cloudflare API.',
    }
  }
}

// Debounce helper to ensure zero spam requests to the API
let debounceTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleDebouncedCloudSync(
  onSync: () => void,
  delayMs: number = 5000
): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    onSync()
  }, delayMs)
}

export function cancelScheduledCloudSync(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}
