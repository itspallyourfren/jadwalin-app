import { describe, expect, it } from 'vitest'
import {
  calcSeinfeldStreak,
  detectCurrentPhase,
  formatSecondsMmSs,
  recommendProductiveSwitchTask,
} from './studyAndTimerEngine'
import type { TrackerTask } from '../data/types'

const createStubTask = (overrides: Partial<TrackerTask>): TrackerTask => ({
  id: 't-1',
  title: 'Tugas A',
  courseOrContext: 'Statistika',
  category: 'Kuliah & Tugas',
  scale: 'Besar',
  status: 'IN_PROGRESS',
  timeBlock: 'Pagi',
  deadlineIso: null,
  internalDeadlineIso: null,
  isImportant: true,
  isUrgentOverride: null,
  isEatThatFrog: false,
  ivyLeeRank: null,
  oneThreeFiveSlot: null,
  subtasks: [],
  manualProgress: 0,
  completedVia85Rule: false,
  woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
  studyNotes: {
    sq3r: { survey: false, question: '', read: false, recite: '', review: false },
    feynmanExplanation: '',
    blurtingDump: '',
    flashcards: [],
  },
  focusMinutesLogged: 0,
  pomodoroCount: 0,
  reminderEnabled: true,
  createdAtIso: '2026-11-04T08:00:00.000Z',
  completedAtIso: null,
  ...overrides,
})

describe('studyAndTimerEngine', () => {
  it('calculates Seinfeld daily streak and 7-day chain accurately', () => {
    const dates = ['2026-11-02', '2026-11-03', '2026-11-04']
    const res = calcSeinfeldStreak(dates, '2026-11-04')
    expect(res.currentStreak).toBe(3)
    expect(res.isTodayCompleted).toBe(true)
    expect(res.last7Days).toHaveLength(7)
    expect(res.last7Days[6].completed).toBe(true)
  })

  it('recommends a lighter or interleaved task for Structured Procrastination', () => {
    const heavyTask = createStubTask({ id: 'heavy', scale: 'Besar', category: 'Kuliah & Tugas' })
    const lightDiffCategory = createStubTask({
      id: 'light-interleaved',
      scale: 'Kecil',
      category: 'Organisasi & Proyek',
      status: 'IN_PROGRESS',
    })
    const anotherHeavy = createStubTask({
      id: 'heavy-2',
      scale: 'Besar',
      category: 'Kuliah & Tugas',
      status: 'BACKLOG',
    })

    const rec = recommendProductiveSwitchTask(heavyTask, [heavyTask, anotherHeavy, lightDiffCategory])
    expect(rec?.id).toBe('light-interleaved')
  })

  it('detects phase and formats timer seconds cleanly', () => {
    expect(detectCurrentPhase(8)).toBe('Pagi')
    expect(detectCurrentPhase(13)).toBe('Siang')
    expect(detectCurrentPhase(16)).toBe('Sore')
    expect(detectCurrentPhase(21)).toBe('Malam')
    expect(formatSecondsMmSs(600)).toBe('10:00')
    expect(formatSecondsMmSs(65)).toBe('01:05')
  })
})
