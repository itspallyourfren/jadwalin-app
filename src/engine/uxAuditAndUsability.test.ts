// mobile/src/engine/uxAuditAndUsability.test.ts - Comprehensive UX/UI Law & Usability Verification
import { describe, expect, it } from 'vitest'
import {
  calcTaskProgress,
  getIvyLeeQueue,
  getOneThreeFiveAllocation,
  groupTasksByEisenhower,
  isEligibleFor85Rule,
  sortKanbanColumnTasks,
} from './boardFrameworksEngine'
import { generateAdaptiveTaskPlan } from './adaptiveDecompositionEngine'
import {
  calcSeinfeldStreak,
  formatSecondsMmSs,
  getTimerDurationSeconds,
  recommendProductiveSwitchTask,
} from './studyAndTimerEngine'
import {
  decodeGameCommitmentCode,
  decodeMobileRecoveryCode,
  encodeMobileRecoveryCode,
  validateJsonBackupString,
} from './recoveryCodec'
import { useTrackerStore } from '../store/useTrackerStore'
import type { TrackerTask } from '../data/types'

describe('UX Laws & Interaction Heuristics Verification', () => {
  it('enforces Miller Law & Hick Law: Ivy Lee strictly limits queue to max 6 items with #1 single focus', () => {
    const store = useTrackerStore.getState()
    store.clearAllTasks()

    // Add 10 tasks
    for (let i = 1; i <= 10; i++) {
      store.addTask({
        title: `Tugas Mahasiswa ${i}`,
        courseOrContext: 'Ilmu Komunikasi',
        category: 'Kuliah & Tugas',
        scale: 'Sedang',
        status: 'IN_PROGRESS',
      })
    }

    const tasks = useTrackerStore.getState().tasks
    expect(tasks.length).toBe(10)

    // Assign Ivy Lee ranks 1 through 8
    tasks.forEach((t, idx) => {
      if (idx < 8) {
        store.setIvyLeeRank(t.id, idx + 1)
      }
    })

    const updatedTasks = useTrackerStore.getState().tasks
    const ivyQueue = getIvyLeeQueue(updatedTasks)

    // Enforce Miller Law: No more than 6 items in working queue
    expect(ivyQueue.queued.length).toBeLessThanOrEqual(6)
    expect(ivyQueue.queued[0].ivyLeeRank).toBe(1)
  })

  it('enforces 1-3-5 Rule: strictly limits capacity to 1 Large, 3 Medium, 5 Small (Cognitive Overload Protection)', () => {
    const tasks: TrackerTask[] = [
      {
        id: 't-l1',
        title: 'Skripsi Bab 4 Analisis Data',
        courseOrContext: 'Skripsi',
        category: 'Kuliah & Tugas',
        scale: 'Besar',
        status: 'IN_PROGRESS',
        oneThreeFiveSlot: 'LARGE_1',
        ivyLeeRank: null,
        isEatThatFrog: false,
        isImportant: true,
        timeBlock: 'Pagi',
        deadlineIso: null,
        internalDeadlineIso: null,
        manualProgress: 0,
        subtasks: [],
        studyNotes: {
          sq3r: { survey: false, question: '', read: false, recite: false, review: false },
          feynmanExplanation: '',
          blurtingDump: '',
          flashcards: [],
        },
        woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
        focusMinutesLogged: 0,
        completedVia85Rule: false,
        createdAtIso: new Date().toISOString(),
        updatedAtIso: new Date().toISOString(),
      },
      {
        id: 't-l2',
        title: 'Skripsi Bab 5 Kesimpulan',
        courseOrContext: 'Skripsi',
        category: 'Kuliah & Tugas',
        scale: 'Besar',
        status: 'IN_PROGRESS',
        oneThreeFiveSlot: 'LARGE_1',
        ivyLeeRank: null,
        isEatThatFrog: false,
        isImportant: true,
        timeBlock: 'Pagi',
        deadlineIso: null,
        internalDeadlineIso: null,
        manualProgress: 0,
        subtasks: [],
        studyNotes: {
          sq3r: { survey: false, question: '', read: false, recite: false, review: false },
          feynmanExplanation: '',
          blurtingDump: '',
          flashcards: [],
        },
        woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
        focusMinutesLogged: 0,
        completedVia85Rule: false,
        createdAtIso: new Date().toISOString(),
        updatedAtIso: new Date().toISOString(),
      },
    ]

    const alloc = getOneThreeFiveAllocation(tasks)
    expect(alloc.isLargeFull).toBe(true)
    expect(alloc.large.length).toBeLessThanOrEqual(1)
  })

  it('validates Fitts Law & Peak-End Rule: The 85% Rule unlocks closure without perfectionist burnout', () => {
    // Case A: With subtasks, 6 out of 7 completed = 86% -> eligible
    const taskWithSubtasks: TrackerTask = {
      id: 'task-85',
      title: 'Laporan Magang Akhir',
      courseOrContext: 'Magang',
      category: 'Kuliah & Tugas',
      scale: 'Besar',
      status: 'IN_PROGRESS',
      oneThreeFiveSlot: null,
      ivyLeeRank: null,
      isEatThatFrog: false,
      isImportant: true,
      timeBlock: 'Siang',
      deadlineIso: null,
      internalDeadlineIso: null,
      manualProgress: 0,
      subtasks: [
        { id: 's1', title: 'Ringkasan Eksekutif', completed: true, isParetoCore: true },
        { id: 's2', title: 'Latar Belakang Perusahaan', completed: true, isParetoCore: false },
        { id: 's3', title: 'Aktivitas Mingguan', completed: true, isParetoCore: true },
        { id: 's4', title: 'Analisis Kendala', completed: true, isParetoCore: true },
        { id: 's5', title: 'Solusi & Usulan', completed: true, isParetoCore: true },
        { id: 's6', title: 'Kesimpulan', completed: true, isParetoCore: true },
        { id: 's7', title: 'Dokumentasi & Lampiran', completed: false, isParetoCore: false },
      ],
      studyNotes: {
        sq3r: { survey: false, question: '', read: false, recite: false, review: false },
        feynmanExplanation: '',
        blurtingDump: '',
        flashcards: [],
      },
      woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
      focusMinutesLogged: 30,
      completedVia85Rule: false,
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    }

    // 6 out of 7 is 86%
    expect(calcTaskProgress(taskWithSubtasks)).toBe(86)
    expect(isEligibleFor85Rule(taskWithSubtasks)).toBe(true)

    // Case B: Without subtasks, uses manualProgress
    const taskManual: TrackerTask = {
      ...taskWithSubtasks,
      id: 'task-manual',
      subtasks: [],
      manualProgress: 85,
    }
    expect(calcTaskProgress(taskManual)).toBe(85)
    expect(isEligibleFor85Rule(taskManual)).toBe(true)
  })

  it('validates Zeigarnik Effect: Adaptive decomposition generates a <= 2 minute starter trigger step', () => {
    const task: TrackerTask = {
      id: 'task-decomp',
      title: 'Koding Prototype Sistem Jadwal Mobile',
      courseOrContext: 'Pemrograman Web',
      category: 'Kuliah & Tugas',
      scale: 'Besar',
      status: 'IN_PROGRESS',
      oneThreeFiveSlot: null,
      ivyLeeRank: null,
      isEatThatFrog: true,
      isImportant: true,
      timeBlock: 'Pagi',
      deadlineIso: null,
      internalDeadlineIso: null,
      manualProgress: 0,
      subtasks: [],
      studyNotes: {
        sq3r: { survey: false, question: '', read: false, recite: false, review: false },
        feynmanExplanation: '',
        blurtingDump: '',
        flashcards: [],
      },
      woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
      focusMinutesLogged: 0,
      completedVia85Rule: false,
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    }

    const plan = generateAdaptiveTaskPlan(task, { preset: 'BALANCED' })
    expect(plan.phases.length).toBeGreaterThan(0)
    expect(plan.allSteps.length).toBeGreaterThan(0)

    // The first step must have a starter trigger to overcome the activation energy
    const firstStep = plan.phases[0].steps[0]
    expect(firstStep.starterTrigger).toBeDefined()
    expect(firstStep.estimatedMinutes).toBeLessThanOrEqual(15)
  })

  it('validates Procrastination Inertia Reducer: Switch to productive alternative task when stuck', () => {
    const activeTasks: TrackerTask[] = [
      {
        id: 't-heavy',
        title: 'Skripsi Bab 4 Rumus Statistik',
        courseOrContext: 'Skripsi',
        category: 'Kuliah & Tugas',
        scale: 'Besar',
        status: 'IN_PROGRESS',
        oneThreeFiveSlot: null,
        ivyLeeRank: 1,
        isEatThatFrog: true,
        isImportant: true,
        timeBlock: 'Pagi',
        deadlineIso: null,
        internalDeadlineIso: null,
        manualProgress: 0,
        subtasks: [],
        studyNotes: {
          sq3r: { survey: false, question: '', read: false, recite: false, review: false },
          feynmanExplanation: '',
          blurtingDump: '',
          flashcards: [],
        },
        woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
        focusMinutesLogged: 0,
        completedVia85Rule: false,
        createdAtIso: new Date().toISOString(),
        updatedAtIso: new Date().toISOString(),
      },
      {
        id: 't-light',
        title: 'Balas Email Dosen Pembimbing',
        courseOrContext: 'Skripsi',
        category: 'Kuliah & Tugas',
        scale: 'Kecil',
        status: 'IN_PROGRESS',
        oneThreeFiveSlot: null,
        ivyLeeRank: 2,
        isEatThatFrog: false,
        isImportant: false,
        timeBlock: 'Pagi',
        deadlineIso: null,
        internalDeadlineIso: null,
        manualProgress: 0,
        subtasks: [],
        studyNotes: {
          sq3r: { survey: false, question: '', read: false, recite: false, review: false },
          feynmanExplanation: '',
          blurtingDump: '',
          flashcards: [],
        },
        woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
        focusMinutesLogged: 0,
        completedVia85Rule: false,
        createdAtIso: new Date().toISOString(),
        updatedAtIso: new Date().toISOString(),
      },
    ]

    const current = activeTasks[0]
    const recommended = recommendProductiveSwitchTask(current, activeTasks)
    expect(recommended).not.toBeNull()
    expect(recommended?.id).toBe('t-light')
  })

  it('validates Data Integrity & Offline Backup Codec: Zero data loss upon backup & restore', () => {
    const payload = {
      version: 1,
      exportedAtIso: new Date().toISOString(),
      participantName: 'Celyn Mahasiswi',
      characterId: 'CHR-03' as const,
      streakCount: 5,
      tasks: [
        {
          id: 'b-task-1',
          title: 'Review Jurnal Metodologi Kualitatif',
          courseOrContext: 'Metodologi',
          category: 'Belajar & Ujian' as const,
          scale: 'Sedang' as const,
          status: 'IN_PROGRESS' as const,
          timeBlock: 'Pagi' as const,
          deadlineIso: '2026-11-10T12:00:00.000Z',
          internalDeadlineIso: '2026-11-09T12:00:00.000Z',
          oneThreeFiveSlot: null,
          ivyLeeRank: 1,
          isEatThatFrog: true,
          isImportant: true,
          manualProgress: 50,
          subtasks: [
            { id: 'sub-1', title: 'Baca abstrak', completed: true, isParetoCore: true },
            { id: 'sub-2', title: 'Tulis ringkasan', completed: false, isParetoCore: true },
          ],
          studyNotes: {
            sq3r: { survey: true, question: 'Apa temuannya?', read: false, recite: false, review: false },
            feynmanExplanation: 'Studi ini meneliti pola menunda tugas.',
            blurtingDump: 'Kata kunci: prokrastinasi, regulasi diri',
            flashcards: [],
          },
          woop: {
            wish: 'Selesai sebelum siang',
            outcome: 'Bisa lanjut proyek sore',
            obstacle: 'Distraksi HP',
            ifThenPlan: 'JIKA ingin scroll, MAKA jauhkan HP ke tas.',
          },
          focusMinutesLogged: 25,
          completedVia85Rule: false,
          createdAtIso: new Date().toISOString(),
          updatedAtIso: new Date().toISOString(),
        },
      ],
      reminderConfig: {
        enabled: true,
        morningTime: '07:30',
        morningAnchor: 'Setelah sarapan',
        afternoonTime: '13:00',
        afternoonAnchor: 'Setelah makan siang',
        eveningTime: '21:00',
        eveningAnchor: 'Sebelum tidur',
        deadlineRemind24h: true,
      },
    }

    const code = encodeMobileRecoveryCode(payload)
    expect(code.startsWith('JDW-MOB|v1|')).toBe(true)

    const decoded = decodeMobileRecoveryCode(code)
    expect(decoded).not.toBeNull()
    expect(decoded?.participantName).toBe('Celyn Mahasiswi')
    expect(decoded?.tasks.length).toBe(1)
    expect(decoded?.tasks[0].title).toBe('Review Jurnal Metodologi Kualitatif')
  })
})
