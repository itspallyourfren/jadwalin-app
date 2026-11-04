import { describe, expect, it } from 'vitest'
import {
  calcTimePressure,
  detectTaskDomain,
  generateAdaptiveTaskPlan,
} from './adaptiveDecompositionEngine'
import type { TrackerTask } from '../data/types'

function makeMockTask(overrides: Partial<TrackerTask> = {}): TrackerTask {
  return {
    id: 'tsk-mock-1',
    title: 'Susun Bab 2 Tinjauan Pustaka Skripsi',
    courseOrContext: 'Metodologi Penelitian',
    category: 'Kuliah & Tugas',
    scale: 'Besar',
    status: 'IN_PROGRESS',
    timeBlock: 'Pagi',
    deadlineIso: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
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
      rubberDuckNotes: '',
      blurtingDump: '',
      flashcards: [],
      interleavingTopics: [],
    },
    focusMinutesLogged: 0,
    pomodoroCount: 0,
    reminderEnabled: true,
    createdAtIso: new Date().toISOString(),
    completedAtIso: null,
    ...overrides,
  }
}

describe('Adaptive Task Decomposition Engine', () => {
  it('detects domain correctly based on Indonesian keywords and context', () => {
    expect(detectTaskDomain('Draf Skripsi Bab 3', 'Metopen', 'Kuliah & Tugas')).toBe(
      'WRITING_ACADEMIC'
    )
    expect(detectTaskDomain('Latihan Soal Ujian Tengah Semester', 'Kalkulus', 'Belajar & Ujian')).toBe(
      'EXAM_STUDY'
    )
    expect(detectTaskDomain('Fixing Bug API Auth & Database', 'Pemrograman Web', 'Kuliah & Tugas')).toBe(
      'CODING_TECH'
    )
    expect(detectTaskDomain('Persiapan Slide Sidang Proposal', 'Komunikasi', 'Kuliah & Tugas')).toBe(
      'PRESENTATION'
    )
    expect(detectTaskDomain('Urus Berkas Legalisir & KRS', 'Tata Usaha', 'Pribadi & Kebiasaan')).toBe(
      'ADMIN_OPERATIONAL'
    )
    expect(detectTaskDomain('Rencana Acara Makrab Angkatan', 'Himpunan', 'Organisasi & Proyek')).toBe(
      'GENERAL_PROJECT'
    )
  })

  it('calculates time pressure based on remaining deadline hours', () => {
    const nearDeadline = new Date(Date.now() + 8 * 3600 * 1000).toISOString()
    const moderateDeadline = new Date(Date.now() + 36 * 3600 * 1000).toISOString()
    const relaxedDeadline = new Date(Date.now() + 120 * 3600 * 1000).toISOString()

    expect(calcTimePressure(nearDeadline, null)).toBe('URGENT')
    expect(calcTimePressure(moderateDeadline, null)).toBe('MODERATE')
    expect(calcTimePressure(relaxedDeadline, null)).toBe('RELAXED')
    expect(calcTimePressure(null, null)).toBe('MODERATE')
  })

  it('generates multi-phase adaptive plan with Pareto 20% and recommended techniques', () => {
    const task = makeMockTask({
      title: 'Laporan Akhir Praktikum Jaringan Komputer',
      scale: 'Sedang',
    })

    const plan = generateAdaptiveTaskPlan(task, { preset: 'BALANCED' })

    expect(plan.domain).toBe('WRITING_ACADEMIC')
    expect(plan.phases.length).toBeGreaterThanOrEqual(2)
    expect(plan.allSteps.length).toBeGreaterThanOrEqual(3)

    // At least one step must be marked as Pareto 20% core
    const paretoSteps = plan.allSteps.filter((s) => s.isParetoCore)
    expect(paretoSteps.length).toBeGreaterThanOrEqual(1)

    // Total estimated minutes must be realistic
    expect(plan.totalEstimatedMinutes).toBeGreaterThan(0)
    expect(plan.recommendedSessions.pomodoroCount).toBeGreaterThan(0)
    expect(plan.recommendedTechniques.length).toBeGreaterThanOrEqual(2)
  })

  it('adjusts steps when URGENT_SPRINT preset is selected (prunes non-essential, prioritizes 85% finish)', () => {
    const task = makeMockTask({
      title: 'Persiapan Slide Presentasi Proyek',
      scale: 'Besar',
      deadlineIso: new Date(Date.now() + 5 * 3600 * 1000).toISOString(), // 5 hours left
    })

    const plan = generateAdaptiveTaskPlan(task, { preset: 'URGENT_SPRINT' })

    expect(plan.timePressureLevel).toBe('URGENT')
    // Sprint mode should focus tightly on core essentials
    expect(plan.recommendedTechniques.some((t) => t.name.includes('85%') || t.name.includes('10'))).toBe(true)
  })
})
