import { describe, expect, it } from 'vitest'
import {
  calcTaskProgress,
  generateChunkedSubtasks,
  getIvyLeeQueue,
  getOneThreeFiveAllocation,
   groupTasksByEisenhower,
  isEligibleFor85Rule,
  resolveEisenhowerQuadrant,
  sortKanbanColumnTasks,
} from './boardFrameworksEngine'
import type { TrackerTask } from '../data/types'

const makeMockTask = (overrides: Partial<TrackerTask> = {}): TrackerTask => ({
  id: 'tsk-1',
  title: 'Makalah Komunikasi Massa',
  courseOrContext: 'Komunikasi Massa',
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

describe('boardFrameworksEngine', () => {
  it('calculates progress from subtasks and triggers The 85% Rule accurately', () => {
    const t1 = makeMockTask({
      subtasks: [
        { id: '1', title: 'A', completed: true, isParetoCore: true },
        { id: '2', title: 'B', completed: true, isParetoCore: true },
        { id: '3', title: 'C', completed: true, isParetoCore: false },
        { id: '4', title: 'D', completed: true, isParetoCore: false },
        { id: '5', title: 'E', completed: true, isParetoCore: false },
        { id: '6', title: 'F', completed: true, isParetoCore: false },
        { id: '7', title: 'G', completed: false, isParetoCore: false },
      ],
    })
    // 6/7 = 86%
    expect(calcTaskProgress(t1)).toBe(86)
    expect(isEligibleFor85Rule(t1)).toBe(true)

    const tDone = makeMockTask({ status: 'COMPLETED', manualProgress: 86 })
    expect(calcTaskProgress(tDone)).toBe(100)
    expect(isEligibleFor85Rule(tDone)).toBe(false)
  })

  it('classifies tasks into Eisenhower 2x2 quadrants based on importance and deadline urgency', () => {
    const now = new Date('2026-11-04T12:00:00.000Z').getTime()
    const urgentTask = makeMockTask({
      id: 'q1',
      isImportant: true,
      deadlineIso: '2026-11-05T10:00:00.000Z', // 22 hours away -> urgent
    })
    const scheduleTask = makeMockTask({
      id: 'q2',
      isImportant: true,
      deadlineIso: '2026-11-10T10:00:00.000Z', // 6 days away -> not urgent
    })
    const delegateTask = makeMockTask({
      id: 'q3',
      scale: 'Kecil',
      isImportant: false,
      isUrgentOverride: true,
    })
    const laterTask = makeMockTask({
      id: 'q4',
      scale: 'Kecil',
      isImportant: false,
      isUrgentOverride: false,
    })

    expect(resolveEisenhowerQuadrant(urgentTask, now)).toBe('DO_FIRST')
    expect(resolveEisenhowerQuadrant(scheduleTask, now)).toBe('SCHEDULE')
    expect(resolveEisenhowerQuadrant(delegateTask, now)).toBe('DELEGATE_FAST')
    expect(resolveEisenhowerQuadrant(laterTask, now)).toBe('SAVE_LATER')

    const grouped = groupTasksByEisenhower([urgentTask, scheduleTask, delegateTask, laterTask], now)
    expect(grouped.DO_FIRST).toHaveLength(1)
    expect(grouped.SCHEDULE).toHaveLength(1)
    expect(grouped.DELEGATE_FAST).toHaveLength(1)
    expect(grouped.SAVE_LATER).toHaveLength(1)
  })

  it('generates Task Chunking subtasks with Zeigarnik starter and Pareto 20% core flags', () => {
    const chunks = generateChunkedSubtasks('Besar', 'Kuliah & Tugas', 'Bab 2 Skripsi')
    expect(chunks.length).toBeGreaterThanOrEqual(4)
    expect(chunks[0].isZeigarnikStarter).toBe(true)
    expect(chunks.some((c) => c.isParetoCore)).toBe(true)
  })

  it('allocates 1-3-5 Rule slots and orders Ivy Lee 6 priorities + Eat That Frog pin', () => {
    const tasks = [
      makeMockTask({ id: 'a', oneThreeFiveSlot: 'LARGE_1', ivyLeeRank: 2, isEatThatFrog: false }),
      makeMockTask({ id: 'b', oneThreeFiveSlot: 'MEDIUM_3', ivyLeeRank: 1, isEatThatFrog: true }),
      makeMockTask({ id: 'c', oneThreeFiveSlot: 'SMALL_5', ivyLeeRank: null, isEatThatFrog: false }),
    ]

    const alloc = getOneThreeFiveAllocation(tasks)
    expect(alloc.large).toHaveLength(1)
    expect(alloc.medium).toHaveLength(1)
    expect(alloc.small).toHaveLength(1)
    expect(alloc.isLargeFull).toBe(true)

    const ivy = getIvyLeeQueue(tasks)
    expect(ivy.queued.map((t) => t.id)).toEqual(['b', 'a'])

    const sorted = sortKanbanColumnTasks(tasks)
    expect(sorted[0].id).toBe('b') // Eat That Frog first
  })
})
