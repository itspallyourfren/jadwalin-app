// src/engine/boardFrameworksEngine.ts - Pure Functions for Kanban, Eisenhower, 1-3-5, Ivy Lee, Chunking & 85% Rule
import { CLUTCH_85_THRESHOLD, IVY_LEE_MAX_ITEMS, ONE_THREE_FIVE_LIMITS } from '../data/constants'
import type {
  EisenhowerQuadrant,
  KanbanStatus,
  SubtaskItem,
  TaskCategory,
  TaskScale,
  TimeBlockTag,
  TrackerTask,
} from '../data/types'

export function calcTaskProgress(task: Pick<TrackerTask, 'subtasks' | 'manualProgress' | 'status'>): number {
  if (task.status === 'COMPLETED') return 100
  if (task.subtasks.length === 0) {
    return Math.max(0, Math.min(100, Math.round(task.manualProgress)))
  }
  const doneCount = task.subtasks.filter((s) => s.completed).length
  return Math.round((doneCount / task.subtasks.length) * 100)
}

export function isEligibleFor85Rule(task: Pick<TrackerTask, 'subtasks' | 'manualProgress' | 'status'>): boolean {
  if (task.status === 'COMPLETED') return false
  const pct = calcTaskProgress(task)
  return pct >= CLUTCH_85_THRESHOLD && pct < 100
}

export function isTaskUrgent(task: Pick<TrackerTask, 'deadlineIso' | 'internalDeadlineIso' | 'isUrgentOverride'>, nowMs: number = Date.now()): boolean {
  if (task.isUrgentOverride !== null) return task.isUrgentOverride
  const effectiveIso = task.internalDeadlineIso || task.deadlineIso
  if (!effectiveIso) return false
  const deadlineMs = new Date(effectiveIso).getTime()
  if (Number.isNaN(deadlineMs)) return false
  const hoursRemaining = (deadlineMs - nowMs) / (1000 * 60 * 60)
  return hoursRemaining <= 48
}

export function resolveEisenhowerQuadrant(
  task: Pick<TrackerTask, 'isImportant' | 'deadlineIso' | 'internalDeadlineIso' | 'isUrgentOverride' | 'scale'>,
  nowMs: number = Date.now()
): EisenhowerQuadrant {
  const important = task.isImportant || task.scale === 'Besar' || task.scale === 'Tugas Akhir'
  const urgent = isTaskUrgent(task, nowMs)

  if (important && urgent) return 'DO_FIRST'
  if (important && !urgent) return 'SCHEDULE'
  if (!important && urgent) return 'DELEGATE_FAST'
  return 'SAVE_LATER'
}

export function groupTasksByEisenhower(
  tasks: readonly TrackerTask[],
  nowMs: number = Date.now()
): Record<EisenhowerQuadrant, TrackerTask[]> {
  const groups: Record<EisenhowerQuadrant, TrackerTask[]> = {
    DO_FIRST: [],
    SCHEDULE: [],
    DELEGATE_FAST: [],
    SAVE_LATER: [],
  }
  for (const task of tasks) {
    if (task.status === 'COMPLETED') continue
    const quadrant = resolveEisenhowerQuadrant(task, nowMs)
    groups[quadrant].push(task)
  }
  return groups
}

export function generateChunkedSubtasks(scale: TaskScale, category: TaskCategory, taskTitle: string): SubtaskItem[] {
  const cleanTitle = taskTitle.trim() || 'tugas ini'
  const prefix = `sub-${Date.now().toString(36)}`

  if (category === 'Belajar & Ujian') {
    return [
      {
        id: `${prefix}-1`,
        title: `Buka materi "${cleanTitle}" & baca subjudul`,
        completed: false,
        isParetoCore: false,
        isZeigarnikStarter: true,
      },
      {
        id: `${prefix}-2`,
        title: 'Tandai konsep utama yang paling sering diujikan',
        completed: false,
        isParetoCore: true,
      },
      {
        id: `${prefix}-3`,
        title: 'Tulis ringkasan singkat dengan bahasa sendiri',
        completed: false,
        isParetoCore: true,
      },
      {
        id: `${prefix}-4`,
        title: 'Latihan jawab pertanyaan tanpa lihat catatan (5 menit)',
        completed: false,
        isParetoCore: false,
      },
    ]
  }

  if (scale === 'Kecil') {
    return [
      {
        id: `${prefix}-1`,
        title: `Siapkan file untuk "${cleanTitle}"`,
        completed: false,
        isParetoCore: false,
        isZeigarnikStarter: true,
      },
      {
        id: `${prefix}-2`,
        title: 'Selesaikan bagian utama & kirim',
        completed: false,
        isParetoCore: true,
      },
    ]
  }

  return [
    {
      id: `${prefix}-1`,
      title: `Buat file baru & tulis kerangka "${cleanTitle}"`,
      completed: false,
      isParetoCore: false,
      isZeigarnikStarter: true,
    },
    {
      id: `${prefix}-2`,
      title: 'Kumpulkan 2–3 referensi utama',
      completed: false,
      isParetoCore: false,
    },
    {
      id: `${prefix}-3`,
      title: 'Kerjakan bagian isi paling penting dulu',
      completed: false,
      isParetoCore: true,
    },
    {
      id: `${prefix}-4`,
      title: 'Lengkapi draf sampai minimal 85%',
      completed: false,
      isParetoCore: true,
    },
    {
      id: `${prefix}-5`,
      title: 'Cek ulang seperlunya & kumpulkan',
      completed: false,
      isParetoCore: false,
    },
  ]
}

export function getOneThreeFiveAllocation(tasks: readonly TrackerTask[]) {
  const active = tasks.filter((t) => t.status !== 'COMPLETED')
  const large = active.filter((t) => t.oneThreeFiveSlot === 'LARGE_1').slice(0, ONE_THREE_FIVE_LIMITS.LARGE_1)
  const medium = active.filter((t) => t.oneThreeFiveSlot === 'MEDIUM_3').slice(0, ONE_THREE_FIVE_LIMITS.MEDIUM_3)
  const small = active.filter((t) => t.oneThreeFiveSlot === 'SMALL_5').slice(0, ONE_THREE_FIVE_LIMITS.SMALL_5)
  const unassigned = active.filter((t) => t.oneThreeFiveSlot === null)

  return {
    large,
    medium,
    small,
    unassigned,
    isLargeFull: large.length >= ONE_THREE_FIVE_LIMITS.LARGE_1,
    isMediumFull: medium.length >= ONE_THREE_FIVE_LIMITS.MEDIUM_3,
    isSmallFull: small.length >= ONE_THREE_FIVE_LIMITS.SMALL_5,
  }
}

export function getIvyLeeQueue(tasks: readonly TrackerTask[]): {
  queued: TrackerTask[]
  candidates: TrackerTask[]
  isQueueFull: boolean
} {
  const active = tasks.filter((t) => t.status !== 'COMPLETED')
  const queued = active
    .filter((t) => t.ivyLeeRank !== null && t.ivyLeeRank >= 1 && t.ivyLeeRank <= IVY_LEE_MAX_ITEMS)
    .sort((a, b) => (a.ivyLeeRank ?? 99) - (b.ivyLeeRank ?? 99))
    .slice(0, IVY_LEE_MAX_ITEMS)

  const queuedIds = new Set(queued.map((t) => t.id))
  const candidates = active.filter((t) => !queuedIds.has(t.id))

  return {
    queued,
    candidates,
    isQueueFull: queued.length >= IVY_LEE_MAX_ITEMS,
  }
}

export function sortKanbanColumnTasks(tasks: readonly TrackerTask[], timeFilter: TimeBlockTag | 'ALL' = 'ALL'): TrackerTask[] {
  const filtered = timeFilter === 'ALL'
    ? [...tasks]
    : tasks.filter((t) => t.timeBlock === timeFilter || t.timeBlock === 'Bebas')

  return filtered.sort((a, b) => {
    // 1. Eat That Frog! selalu di paling atas
    if (a.isEatThatFrog !== b.isEatThatFrog) return a.isEatThatFrog ? -1 : 1
    // 2. Ivy Lee Rank jika ada
    if (a.ivyLeeRank !== null && b.ivyLeeRank !== null && a.ivyLeeRank !== b.ivyLeeRank) {
      return a.ivyLeeRank - b.ivyLeeRank
    }
    // 3. Berdasarkan deadline terdekat
    const aDead = a.internalDeadlineIso || a.deadlineIso
    const bDead = b.internalDeadlineIso || b.deadlineIso
    if (aDead && bDead) return new Date(aDead).getTime() - new Date(bDead).getTime()
    if (aDead) return -1
    if (bDead) return 1
    return 0
  })
}

export function groupTasksByKanbanStage(
  tasks: readonly TrackerTask[],
  timeFilter: TimeBlockTag | 'ALL' = 'ALL'
): Record<KanbanStatus, TrackerTask[]> {
  const result: Record<KanbanStatus, TrackerTask[]> = {
    BACKLOG: [],
    RESEARCH: [],
    IN_PROGRESS: [],
    REVIEW: [],
    COMPLETED: [],
    BLOCKED: [],
  }

  const sorted = sortKanbanColumnTasks(tasks, timeFilter)
  for (const t of sorted) {
    if (t.status in result) {
      result[t.status].push(t)
    } else {
      result.IN_PROGRESS.push(t)
    }
  }

  return result
}

export function groupTasksByKanbanCategory(
  tasks: readonly TrackerTask[],
  timeFilter: TimeBlockTag | 'ALL' = 'ALL'
): Record<TaskCategory, TrackerTask[]> {
  const result: Record<TaskCategory, TrackerTask[]> = {
    'Kuliah & Tugas': [],
    'Belajar & Ujian': [],
    'Organisasi & Proyek': [],
    'Pribadi & Kebiasaan': [],
  }

  const sorted = sortKanbanColumnTasks(tasks, timeFilter)
  for (const t of sorted) {
    if (t.category in result) {
      result[t.category].push(t)
    } else {
      result['Kuliah & Tugas'].push(t)
    }
  }

  return result
}
