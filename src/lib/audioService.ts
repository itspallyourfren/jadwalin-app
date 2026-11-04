// src/lib/audioService.ts - Tactile UI Sound Effects System (Powered by uisfx)

export type SoundEffectType =
  | 'NOTIFICATION'
  | 'COMPLETE'
  | 'SUCCESS'
  | 'CHECK'
  | 'UNCHECK'
  | 'START'
  | 'STREAK'
  | 'TICK'
  | 'DELETE'

const SOUND_PATHS: Record<SoundEffectType, string> = {
  NOTIFICATION: './assets/audio/notification.mp3',
  COMPLETE: './assets/audio/complete.mp3',
  SUCCESS: './assets/audio/success.mp3',
  CHECK: './assets/audio/check.mp3',
  UNCHECK: './assets/audio/uncheck.mp3',
  START: './assets/audio/start.mp3',
  STREAK: './assets/audio/streak.mp3',
  TICK: './assets/audio/progress-step.mp3',
  DELETE: './assets/audio/delete.mp3',
}

const DEFAULT_VOLUMES: Record<SoundEffectType, number> = {
  NOTIFICATION: 0.65,
  COMPLETE: 0.6,
  SUCCESS: 0.6,
  CHECK: 0.45,
  UNCHECK: 0.35,
  START: 0.5,
  STREAK: 0.65,
  TICK: 0.35,
  DELETE: 0.4,
}

// Global sound enabled flag
let soundEnabled = true

export function setAudioEnabled(enabled: boolean): void {
  soundEnabled = enabled
}

export function isAudioEnabled(): boolean {
  return soundEnabled
}

// Audio element pool cache for instant low-latency playback
const audioCache = new Map<SoundEffectType, HTMLAudioElement>()

function getAudioElement(type: SoundEffectType): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null

  let audio = audioCache.get(type)
  if (!audio) {
    try {
      audio = new Audio(SOUND_PATHS[type])
      audio.preload = 'auto'
      audioCache.set(type, audio)
    } catch {
      return null
    }
  }
  return audio
}

/**
 * Play a specific UI sound effect if sound is enabled.
 */
export function playUiSound(type: SoundEffectType, volumeOverride?: number): void {
  if (typeof window === 'undefined') return
  if (!soundEnabled) return

  const audio = getAudioElement(type)
  if (!audio) return

  try {
    audio.currentTime = 0
    audio.volume = volumeOverride ?? DEFAULT_VOLUMES[type] ?? 0.5
    const promise = audio.play()
    if (promise !== undefined) {
      promise.catch(() => {
        // Silently catch autoplay restriction errors (e.g. before user gesture)
      })
    }
  } catch {
    // Graceful fallback for non-supported audio contexts
  }
}

// Helper shortcuts for common key events
export const soundFx = {
  notification: () => playUiSound('NOTIFICATION'),
  complete: () => playUiSound('COMPLETE'),
  success: () => playUiSound('SUCCESS'),
  check: () => playUiSound('CHECK'),
  uncheck: () => playUiSound('UNCHECK'),
  start: () => playUiSound('START'),
  streak: () => playUiSound('STREAK'),
  tick: () => playUiSound('TICK'),
  delete: () => playUiSound('DELETE'),
}
