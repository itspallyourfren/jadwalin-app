// src/store/idbMirror.ts - Resilient IndexedDB Mirror & Native/Web Local Notification Dispatcher
import { LocalNotifications } from '@capacitor/local-notifications'
import { buildUpcomingNotificationSchedule } from '../engine/notificationScheduler'
import type { HabitReminderConfig, MobileBackupPayload, TrackerTask } from '../data/types'

const IDB_NAME = 'jadwalin_mobile_resilient_db'
const IDB_STORE = 'backup_snapshots'
const IDB_KEY = 'latest_snapshot_v1'

function isBrowserWithIdb(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

export async function saveSnapshotToIndexedDb(payload: MobileBackupPayload): Promise<void> {
  if (!isBrowserWithIdb()) return
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      store.put(payload, IDB_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // Silent fallback when running in private/restricted webview
  }
}

export async function loadSnapshotFromIndexedDb(): Promise<MobileBackupPayload | null> {
  if (!isBrowserWithIdb()) return null
  try {
    const db = await openDb()
    const result = await new Promise<MobileBackupPayload | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const store = tx.objectStore(IDB_STORE)
      const req = store.get(IDB_KEY)
      req.onsuccess = () => resolve((req.result as MobileBackupPayload) ?? null)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return result
  } catch {
    return null
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function syncDeviceNotifications(
  tasks: readonly TrackerTask[],
  config: HabitReminderConfig
): Promise<{ permissionStatus: 'granted' | 'denied' | 'prompt' | 'unsupported'; scheduledCount: number }> {
  if (typeof window === 'undefined') {
    return { permissionStatus: 'unsupported', scheduledCount: 0 }
  }

  const schedule = buildUpcomingNotificationSchedule(tasks, config)

  // 1. Try Capacitor LocalNotifications (Android/iOS Native APK or Web fallback)
  try {
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display === 'granted') {
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications })
      }
      if (config.enabled && schedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: schedule.map((slot) => ({
            id: slot.id,
            title: slot.title,
            body: slot.body,
            schedule: { at: new Date(slot.scheduleAtMs) },
            extra: { tag: slot.tag, relatedTaskId: slot.relatedTaskId },
          })),
        })
      }
      return { permissionStatus: 'granted', scheduledCount: schedule.length }
    }
  } catch {
    // Fallback to standard Web Notification API check
  }

  if ('Notification' in window) {
    const status = Notification.permission === 'default' ? 'prompt' : Notification.permission
    return { permissionStatus: status, scheduledCount: status === 'granted' ? schedule.length : 0 }
  }

  return { permissionStatus: 'unsupported', scheduledCount: 0 }
}

export async function requestDeviceNotificationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (typeof window === 'undefined') return 'unsupported'

  try {
    const res = await LocalNotifications.requestPermissions()
    if (res.display === 'granted') return 'granted'
  } catch {
    // Fallback to browser Notification API
  }

  if ('Notification' in window) {
    const p = await Notification.requestPermission()
    return p === 'default' ? 'prompt' : p
  }

  return 'unsupported'
}

export function fireInstantBrowserNotification(title: string, body: string): void {
  if (typeof window === 'undefined') return
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: './assets/logo/logo_jadwalin.webp',
      })
    } catch {
      // Service worker or mobile browser restriction; in-app banner still displays
    }
  }
}
