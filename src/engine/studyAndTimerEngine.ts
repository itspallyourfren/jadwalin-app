// src/engine/studyAndTimerEngine.ts - Pure Functions for Seinfeld Streak, Structured Procrastination, & Timer Helpers
import { TIMER_DURATION_SECONDS } from '../data/constants'
import type { Phase, TimerMode, TrackerTask } from '../data/types'

export function formatDateYmd(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function detectCurrentPhase(hour24: number = new Date().getHours()): Phase {
  if (hour24 >= 5 && hour24 < 11) return 'Pagi'
  if (hour24 >= 11 && hour24 < 15) return 'Siang'
  if (hour24 >= 15 && hour24 < 19) return 'Sore'
  return 'Malam'
}

export function calcSeinfeldStreak(completedDates: readonly string[], todayYmd: string = formatDateYmd()): {
  currentStreak: number
  isTodayCompleted: boolean
  last7Days: Array<{ dateYmd: string; label: string; completed: boolean; isToday: boolean }>
} {
  const set = new Set(completedDates)
  const isTodayCompleted = set.has(todayYmd)

  const [ty, tm, td] = todayYmd.split('-').map(Number)
  const baseDate = new Date(ty, (tm || 1) - 1, td || 1)

  let streak = 0
  const startOffset = isTodayCompleted ? 0 : 1
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() - i)
    const ymd = formatDateYmd(d)
    if (set.has(ymd)) {
      streak++
    } else {
      break
    }
  }

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const last7Days: Array<{ dateYmd: string; label: string; completed: boolean; isToday: boolean }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() - i)
    const ymd = formatDateYmd(d)
    last7Days.push({
      dateYmd: ymd,
      label: dayNames[d.getDay()],
      completed: set.has(ymd),
      isToday: i === 0,
    })
  }

  return {
    currentStreak: streak,
    isTodayCompleted,
    last7Days,
  }
}

/**
 * TEK_26 Structured Procrastination & TEK_19 Interleaving Method:
 * Saat pengguna merasa buntu di satu tugas berat, rekomendasikan 1 tugas lain yang:
 * 1) Belum selesai dan berbeda ID,
 * 2) Diutamakan yang skalanya lebih ringan (Kecil/Sedang) atau dari kategori/mata kuliah berbeda.
 */
export function recommendProductiveSwitchTask(
  currentTask: TrackerTask,
  allTasks: readonly TrackerTask[]
): TrackerTask | null {
  const candidates = allTasks.filter((t) => t.id !== currentTask.id && t.status !== 'COMPLETED')
  if (candidates.length === 0) return null

  const scaleWeight: Record<TrackerTask['scale'], number> = {
    Kecil: 1,
    Sedang: 2,
    Besar: 3,
    'Tugas Akhir': 4,
  }

  const scored = candidates.map((task) => {
    let score = 0
    // Prioritaskan yang sedang ada di Fokus Hari Ini
    if (task.status === 'IN_PROGRESS') score += 10
    // Interleaving: kategori atau mata kuliah berbeda
    if (task.category !== currentTask.category || task.courseOrContext !== currentTask.courseOrContext) {
      score += 6
    }
    // Structured Procrastination: skala lebih ringan dari tugas saat ini
    if (scaleWeight[task.scale] < scaleWeight[currentTask.scale]) {
      score += 8
    }
    return { task, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].task
}

export function getTimerDurationSeconds(mode: TimerMode): number {
  return TIMER_DURATION_SECONDS[mode]
}

export function formatSecondsMmSs(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  const mins = Math.floor(clamped / 60)
  const secs = clamped % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
