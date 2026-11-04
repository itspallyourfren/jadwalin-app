// src/engine/notificationScheduler.ts - Pure Notification Schedule Builder & Native/Web Dispatcher
import type { HabitReminderConfig, SimulatedNotificationItem, TrackerTask } from '../data/types'

export type ScheduledReminderSlot = {
  id: number
  title: string
  body: string
  scheduleAtMs: number
  tag: string
  relatedTaskId?: string
}

/**
 * Menghasilkan daftar jadwal pengingat lokal (Habit Stacking Harian + Pengingat Deadline H-24j & H-2j)
 * untuk 24 jam ke depan.
 */
export function buildUpcomingNotificationSchedule(
  tasks: readonly TrackerTask[],
  config: HabitReminderConfig,
  nowMs: number = Date.now()
): ScheduledReminderSlot[] {
  if (!config.enabled) return []

  const slots: ScheduledReminderSlot[] = []
  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED')
  const inProgressTasks = activeTasks.filter((t) => t.status === 'IN_PROGRESS')
  const frogTask = activeTasks.find((t) => t.isEatThatFrog)

  const resolveNextTimeMs = (hhmm: string): number | null => {
    const parts = hhmm.split(':').map(Number)
    if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null
    const d = new Date(nowMs)
    d.setHours(parts[0], parts[1], 0, 0)
    if (d.getTime() <= nowMs) {
      d.setDate(d.getDate() + 1)
    }
    return d.getTime()
  }

  // 1. Pengingat Habit Stacking Pagi (Eat That Frog / 10-Minute Rule)
  const morningMs = resolveNextTimeMs(config.morningTime)
  if (morningMs) {
    const targetTitle = frogTask?.title || inProgressTasks[0]?.title || activeTasks[0]?.title
    slots.push({
      id: 1001,
      title: `☀️ Pagi Produktif (${config.morningAnchor})`,
      body: targetTitle
        ? `Yuk buka "${targetTitle}" selama 10 menit saja (10-Minute Rule) sebelum memulai aktivitas lain!`
        : 'Meja belajarmu siap! Pilih 1 tugas utama hari ini dengan metode Eat That Frog atau 1-3-5.',
      scheduleAtMs: morningMs,
      tag: 'HABIT_MORNING',
      relatedTaskId: frogTask?.id || inProgressTasks[0]?.id,
    })
  }

  // 2. Pengingat Habit Stacking Siang/Sore
  const afternoonMs = resolveNextTimeMs(config.afternoonTime)
  if (afternoonMs) {
    slots.push({
      id: 1002,
      title: `⚡ Cek Fokus Siang (${config.afternoonAnchor})`,
      body:
        inProgressTasks.length > 0
          ? `Ada ${inProgressTasks.length} tugas di Fokus Hari Ini. Mau lanjutkan 1 siklus Pomodoro (25 menit)?`
          : 'Saatnya cek papan Kanban dan cicil 1 langkah kecil agar rantai harianmu tetap menyala!',
      scheduleAtMs: afternoonMs,
      tag: 'HABIT_AFTERNOON',
    })
  }

  // 3. Pengingat Habit Stacking Malam (Evaluasi & Ivy Lee 6 Prioritas)
  const eveningMs = resolveNextTimeMs(config.eveningTime)
  if (eveningMs) {
    slots.push({
      id: 1003,
      title: `🌙 Rencana Malam (${config.eveningAnchor})`,
      body: 'Susun maksimal 6 prioritas Ivy Lee untuk besok agar pagi harimu langsung terarah tanpa bingung.',
      scheduleAtMs: eveningMs,
      tag: 'HABIT_EVENING',
    })
  }

  // 4. Pengingat Tenggat Waktu Tugas (H-24 Jam dan H-2 Jam)
  let seqId = 2000
  for (const task of activeTasks) {
    if (!task.reminderEnabled) continue
    const effectiveIso = task.internalDeadlineIso || task.deadlineIso
    if (!effectiveIso) continue
    const deadlineMs = new Date(effectiveIso).getTime()
    if (Number.isNaN(deadlineMs) || deadlineMs <= nowMs) continue

    if (config.deadlineRemind24h) {
      const h24Ms = deadlineMs - 24 * 60 * 60 * 1000
      if (h24Ms > nowMs) {
        slots.push({
          id: seqId++,
          title: `📅 H-1 Tenggat: ${task.title}`,
          body: 'Tenggat waktu besok! Cicil 20% bagian intinya hari ini pakai Task Chunking yuk.',
          scheduleAtMs: h24Ms,
          tag: 'DEADLINE_24H',
          relatedTaskId: task.id,
        })
      }
    }

    if (config.deadlineRemind2h) {
      const h2Ms = deadlineMs - 2 * 60 * 60 * 1000
      if (h2Ms > nowMs) {
        slots.push({
          id: seqId++,
          title: `⏰ 2 Jam Menuju Tenggat: ${task.title}`,
          body: 'Jika progres sudah mencapai 85%, gunakan The 85% Rule dan segera kumpulkan tanpa ragu!',
          scheduleAtMs: h2Ms,
          tag: 'DEADLINE_2H',
          relatedTaskId: task.id,
        })
      }
    }
  }

  return slots.sort((a, b) => a.scheduleAtMs - b.scheduleAtMs)
}

export function createImmediateSampleNotification(
  tasks: readonly TrackerTask[],
  config: HabitReminderConfig
): SimulatedNotificationItem {
  const active = tasks.filter((t) => t.status !== 'COMPLETED')
  const frogOrFirst = active.find((t) => t.isEatThatFrog) ?? active.find((t) => t.status === 'IN_PROGRESS') ?? active[0]

  if (frogOrFirst) {
    return {
      id: `sim-${Date.now()}`,
      title: `🔔 Pengingat Tugas: ${frogOrFirst.title}`,
      body: `Jangan tunggu sempurna! Buka "${frogOrFirst.title}" pakai 10-Minute Rule sekarang (${config.morningAnchor}).`,
      tag: 'TEST_TASK_REMINDER',
      triggeredAtIso: new Date().toISOString(),
      relatedTaskId: frogOrFirst.id,
    }
  }

  return {
    id: `sim-${Date.now()}`,
    title: '🔔 Jadwal-In! Pengingat Kebiasaan Harian',
    body: `Waktunya cek Fokus Hari Ini (${config.morningAnchor}) dan jaga rantai konsistensi Seinfeld-mu!`,
    tag: 'TEST_HABIT_REMINDER',
    triggeredAtIso: new Date().toISOString(),
  }
}
