import { describe, expect, it } from 'vitest'
import { DEFAULT_HABIT_REMINDER_CONFIG } from '../data/constants'
import {
  buildUpcomingNotificationSchedule,
  createImmediateSampleNotification,
} from './notificationScheduler'
import type { TrackerTask } from '../data/types'

const makeStubTask = (overrides: Partial<TrackerTask>): TrackerTask => ({
  id: 'tsk-rem-1',
  title: 'Laporan Praktikum Kimia',
  courseOrContext: 'Kimia Dasar',
  category: 'Kuliah & Tugas',
  scale: 'Sedang',
  status: 'IN_PROGRESS',
  timeBlock: 'Pagi',
  deadlineIso: '2026-11-05T16:00:00.000Z',
  internalDeadlineIso: null,
  isImportant: true,
  isUrgentOverride: null,
  isEatThatFrog: true,
  ivyLeeRank: 1,
  oneThreeFiveSlot: 'MEDIUM_3',
  subtasks: [],
  manualProgress: 40,
  completedVia85Rule: false,
  woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
  studyNotes: {
    sq3r: { survey: false, question: '', read: false, recite: '', review: false },
    feynmanExplanation: '',
    blurtingDump: '',
    flashcards: [],
  },
  focusMinutesLogged: 25,
  pomodoroCount: 1,
  reminderEnabled: true,
  createdAtIso: '2026-11-04T06:00:00.000Z',
  completedAtIso: null,
  ...overrides,
})

describe('notificationScheduler', () => {
  it('builds daily Habit Stacking slots and H-24h / H-2h deadline reminders', () => {
    const nowMs = new Date('2026-11-04T07:00:00.000Z').getTime()
    const task = makeStubTask({ deadlineIso: '2026-11-05T16:00:00.000Z' })
    const schedule = buildUpcomingNotificationSchedule([task], DEFAULT_HABIT_REMINDER_CONFIG, nowMs)

    expect(schedule.some((s) => s.tag === 'HABIT_MORNING')).toBe(true)
    expect(schedule.some((s) => s.tag === 'HABIT_AFTERNOON')).toBe(true)
    expect(schedule.some((s) => s.tag === 'HABIT_EVENING')).toBe(true)
    expect(schedule.some((s) => s.tag === 'DEADLINE_24H')).toBe(true)
    expect(schedule.some((s) => s.tag === 'DEADLINE_2H')).toBe(true)
  })

  it('creates an immediate sample notification referencing the top priority task', () => {
    const task = makeStubTask({ title: 'Presentasi Kelompok' })
    const notif = createImmediateSampleNotification([task], DEFAULT_HABIT_REMINDER_CONFIG)
    expect(notif.title).toContain('Presentasi Kelompok')
    expect(notif.relatedTaskId).toBe(task.id)
  })
})
