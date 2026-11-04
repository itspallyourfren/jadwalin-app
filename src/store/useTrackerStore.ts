// src/store/useTrackerStore.ts - Zustand Store with Dual-Storage Resilience (localStorage + IndexedDB)
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { DEFAULT_HABIT_REMINDER_CONFIG, IVY_LEE_MAX_ITEMS } from '../data/constants'
import { calcTaskProgress, generateChunkedSubtasks } from '../engine/boardFrameworksEngine'
import { createImmediateSampleNotification } from '../engine/notificationScheduler'
import { formatDateYmd } from '../engine/studyAndTimerEngine'
import {
  fireInstantBrowserNotification,
  loadSnapshotFromIndexedDb,
  saveSnapshotToIndexedDb,
  syncDeviceNotifications,
} from './idbMirror'
import type {
  BoardFrameworkView,
  CharacterId,
  HabitReminderConfig,
  ImportedGameCommitment,
  KanbanStatus,
  MobileBackupPayload,
  SimulatedNotificationItem,
  StudyCompanionNotes,
  SubtaskItem,
  TaskCategory,
  TaskScale,
  TimeBlockTag,
  TrackerTask,
  WoopNote,
} from '../data/types'

function createStarterTasks(): TrackerTask[] {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 26 * 60 * 60 * 1000).toISOString()
  const inFourDays = new Date(now.getTime() + 96 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'starter-1',
      title: 'Susun Bab Pendahuluan & Rumusan Masalah',
      courseOrContext: 'Metodologi Penelitian',
      category: 'Kuliah & Tugas',
      scale: 'Besar',
      status: 'IN_PROGRESS',
      timeBlock: 'Pagi',
      deadlineIso: tomorrow,
      internalDeadlineIso: null,
      isImportant: true,
      isUrgentOverride: true,
      isEatThatFrog: true,
      ivyLeeRank: 1,
      oneThreeFiveSlot: 'LARGE_1',
      subtasks: [
        {
          id: 'st-1-1',
          title: 'Buka dokumen & tulis subjudul utama',
          completed: true,
          isParetoCore: false,
          isZeigarnikStarter: true,
        },
        {
          id: 'st-1-2',
          title: 'Kumpulkan 3 jurnal referensi utama',
          completed: true,
          isParetoCore: false,
        },
        {
          id: 'st-1-3',
          title: 'Tulis rumusan masalah & tujuan riset',
          completed: true,
          isParetoCore: true,
        },
        {
          id: 'st-1-4',
          title: 'Lengkapi latar belakang data pendukung',
          completed: false,
          isParetoCore: true,
        },
      ],
      manualProgress: 75,
      completedVia85Rule: false,
      woop: {
        wish: 'Menyelesaikan draf Bab 1 tepat waktu tanpa begadang',
        outcome: 'Pikiran tenang saat bimbingan dosen minggu ini',
        obstacle: 'Sering terdistraksi ganti-ganti kalimat di paragraf pertama',
        ifThenPlan: 'Jika mulai perfeksionis mengedit kalimat awal, maka lanjutkan tulis poin kasar sampai 85% dulu',
      },
      studyNotes: {
        sq3r: { survey: false, question: '', read: false, recite: '', review: false },
        feynmanExplanation: '',
        blurtingDump: '',
        flashcards: [],
      },
      focusMinutesLogged: 35,
      pomodoroCount: 1,
      reminderEnabled: true,
      createdAtIso: now.toISOString(),
      completedAtIso: null,
    },
    {
      id: 'starter-2',
      title: 'Rangkum Materi Kuis Psikologi Kognitif Bab 4',
      courseOrContext: 'Psikologi Kognitif',
      category: 'Belajar & Ujian',
      scale: 'Sedang',
      status: 'IN_PROGRESS',
      timeBlock: 'Siang',
      deadlineIso: inFourDays,
      internalDeadlineIso: null,
      isImportant: true,
      isUrgentOverride: false,
      isEatThatFrog: false,
      ivyLeeRank: 2,
      oneThreeFiveSlot: 'MEDIUM_3',
      subtasks: [
        {
          id: 'st-2-1',
          title: 'Baca subjudul & buat 3 pertanyaan inti',
          completed: true,
          isParetoCore: true,
          isZeigarnikStarter: true,
        },
        {
          id: 'st-2-2',
          title: 'Tulis ringkasan memori kerja dengan bahasa sendiri',
          completed: false,
          isParetoCore: true,
        },
      ],
      manualProgress: 50,
      completedVia85Rule: false,
      woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
      studyNotes: {
        sq3r: {
          survey: true,
          question: 'Apa perbedaan kapasitas Working Memory vs Long-Term Memory?',
          read: true,
          recite: 'Working memory terbatas sekitar 7±2 chunk (Miller), sedangkan LTM menyimpan skema jangka panjang.',
          review: false,
        },
        feynmanExplanation:
          'Memori kerja itu ibarat meja belajar kecil tempat kita menaruh buku yang sedang dibuka sekarang, bukan lemari arsip besar.',
        blurtingDump: '',
        flashcards: [
          {
            id: 'fc-1',
            question: 'Berapa batas rata-rata chunk pada Hukum Miller?',
            answer: '7 ± 2 bongkahan informasi sekaligus.',
            box: 2,
          },
        ],
      },
      focusMinutesLogged: 25,
      pomodoroCount: 1,
      reminderEnabled: true,
      createdAtIso: now.toISOString(),
      completedAtIso: null,
    },
    {
      id: 'starter-3',
      title: 'Balas Email Konfirmasi Jadwal Diskusi Kelompok',
      courseOrContext: 'Organisasi Kampus',
      category: 'Organisasi & Proyek',
      scale: 'Kecil',
      status: 'BACKLOG',
      timeBlock: 'Sore',
      deadlineIso: tomorrow,
      internalDeadlineIso: null,
      isImportant: false,
      isUrgentOverride: true,
      isEatThatFrog: false,
      ivyLeeRank: 3,
      oneThreeFiveSlot: 'SMALL_5',
      subtasks: [
        {
          id: 'st-3-1',
          title: 'Cek ketersediaan jam kosong di kalender',
          completed: true,
          isParetoCore: true,
        },
        {
          id: 'st-3-2',
          title: 'Kirim balasan singkat di grup/email',
          completed: false,
          isParetoCore: true,
        },
      ],
      manualProgress: 50,
      completedVia85Rule: false,
      woop: { wish: '', outcome: '', obstacle: '', ifThenPlan: '' },
      studyNotes: {
        sq3r: { survey: false, question: '', read: false, recite: '', review: false },
        feynmanExplanation: '',
        blurtingDump: '',
        flashcards: [],
      },
      focusMinutesLogged: 10,
      pomodoroCount: 0,
      reminderEnabled: true,
      createdAtIso: now.toISOString(),
      completedAtIso: null,
    },
  ]
}

export type NewTaskInput = {
  title: string
  courseOrContext: string
  category: TaskCategory
  scale: TaskScale
  status?: KanbanStatus
  timeBlock?: TimeBlockTag
  deadlineIso?: string | null
  internalDeadlineIso?: string | null
  isImportant?: boolean
  isEatThatFrog?: boolean
  autoChunk?: boolean
}

export type TrackerStoreState = {
  participantName: string
  characterId: CharacterId
  activeBoardView: BoardFrameworkView
  activeMobileKanbanTab: KanbanStatus
  activeTimeFilter: TimeBlockTag | 'ALL'
  ivyLeeSingleFocusMode: boolean
  desktopPreviewMode: 'PHONE_FRAME' | 'FULL_RESPONSIVE'
  tasks: TrackerTask[]
  completedDates: string[]
  reminderConfig: HabitReminderConfig
  gameCommitment: ImportedGameCommitment | null
  simulatedNotifications: SimulatedNotificationItem[]
  lastBackupSyncedIso: string | null

  // Actions
  setParticipantProfile: (name: string, characterId: CharacterId) => void
  setActiveBoardView: (view: BoardFrameworkView) => void
  setActiveMobileKanbanTab: (tab: KanbanStatus) => void
  setActiveTimeFilter: (filter: TimeBlockTag | 'ALL') => void
  setIvyLeeSingleFocusMode: (enabled: boolean) => void
  setDesktopPreviewMode: (mode: 'PHONE_FRAME' | 'FULL_RESPONSIVE') => void

  addTask: (input: NewTaskInput) => string
  updateTask: (taskId: string, patch: Partial<TrackerTask>) => void
  deleteTask: (taskId: string) => void
  moveTaskStatus: (taskId: string, status: KanbanStatus) => void
  toggleEatThatFrog: (taskId: string) => void
  setOneThreeFiveSlot: (taskId: string, slot: TrackerTask['oneThreeFiveSlot']) => void
  setIvyLeeRank: (taskId: string, rank: number | null) => void
  setTaskQuadrant: (taskId: string, isImportant: boolean, isUrgentOverride: boolean) => void

  autoChunkTask: (taskId: string) => void
  applyAdaptivePlan: (taskId: string, steps: Array<{ title: string; isParetoCore: boolean }>) => void
  addSubtask: (taskId: string, title: string, isParetoCore?: boolean) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  toggleSubtaskPareto: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  completeTaskVia85Rule: (taskId: string) => void
  updateWoopNote: (taskId: string, woop: WoopNote) => void
  updateStudyNotes: (taskId: string, studyNotes: StudyCompanionNotes) => void

  logFocusSession: (taskId: string | null, minutes: number, isPomodoro: boolean) => void
  updateReminderConfig: (patch: Partial<HabitReminderConfig>) => void
  triggerSampleNotification: (customTitle?: string, customBody?: string, relatedTaskId?: string) => void
  dismissSimulatedNotification: (id: string) => void

  exportBackupPayload: () => MobileBackupPayload
  importBackupPayload: (payload: MobileBackupPayload) => void
  importGameCommitment: (commitment: ImportedGameCommitment) => void
  recoverFromIndexedDbIfNeeded: () => Promise<boolean>
}

function buildBackupSnapshot(state: TrackerStoreState): MobileBackupPayload {
  return {
    version: 1,
    exportedAtIso: new Date().toISOString(),
    participantName: state.participantName,
    characterId: state.characterId,
    tasks: state.tasks,
    completedDates: state.completedDates,
    reminderConfig: state.reminderConfig,
    gameCommitment: state.gameCommitment,
  }
}

export const useTrackerStore = create<TrackerStoreState>()(
  persist(
    (set, get) => {
      const mirrorToIdb = () => {
        const snapshot = buildBackupSnapshot(get())
        void saveSnapshotToIndexedDb(snapshot)
      }

      const markTodayActive = (dates: string[]): string[] => {
        const today = formatDateYmd()
        return dates.includes(today) ? dates : [...dates, today]
      }

      return {
        participantName: 'Peserta Jadwal-In',
        characterId: 'CHR-01',
        activeBoardView: 'KANBAN',
        activeMobileKanbanTab: 'IN_PROGRESS',
        activeTimeFilter: 'ALL',
        ivyLeeSingleFocusMode: false,
        desktopPreviewMode: 'FULL_RESPONSIVE',
        tasks: createStarterTasks(),
        completedDates: [formatDateYmd()],
        reminderConfig: DEFAULT_HABIT_REMINDER_CONFIG,
        gameCommitment: null,
        simulatedNotifications: [],
        lastBackupSyncedIso: new Date().toISOString(),

        setParticipantProfile: (participantName, characterId) => {
          set({ participantName, characterId, lastBackupSyncedIso: new Date().toISOString() })
          mirrorToIdb()
        },

        setActiveBoardView: (activeBoardView) => set({ activeBoardView }),
        setActiveMobileKanbanTab: (activeMobileKanbanTab) => set({ activeMobileKanbanTab }),
        setActiveTimeFilter: (activeTimeFilter) => set({ activeTimeFilter }),
        setIvyLeeSingleFocusMode: (ivyLeeSingleFocusMode) => set({ ivyLeeSingleFocusMode }),
        setDesktopPreviewMode: (desktopPreviewMode) => set({ desktopPreviewMode }),

        addTask: (input) => {
          const id = `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          const scale = input.scale
          const category = input.category
          const subtasks = input.autoChunk
            ? generateChunkedSubtasks(scale, category, input.title)
            : []

          const newTask: TrackerTask = {
            id,
            title: input.title.trim(),
            courseOrContext: input.courseOrContext.trim() || 'Umum',
            category,
            scale,
            status: input.status ?? 'IN_PROGRESS',
            timeBlock: input.timeBlock ?? 'Pagi',
            deadlineIso: input.deadlineIso ?? null,
            internalDeadlineIso: input.internalDeadlineIso ?? null,
            isImportant: input.isImportant ?? (scale === 'Besar' || scale === 'Tugas Akhir'),
            isUrgentOverride: null,
            isEatThatFrog: Boolean(input.isEatThatFrog),
            ivyLeeRank: null,
            oneThreeFiveSlot:
              scale === 'Besar' || scale === 'Tugas Akhir'
                ? 'LARGE_1'
                : scale === 'Sedang'
                ? 'MEDIUM_3'
                : 'SMALL_5',
            subtasks,
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
            createdAtIso: new Date().toISOString(),
            completedAtIso: null,
          }

          set((s) => {
            const cleanedTasks = input.isEatThatFrog
              ? s.tasks.map((t) => ({ ...t, isEatThatFrog: false }))
              : s.tasks
            return {
              tasks: [newTask, ...cleanedTasks],
              lastBackupSyncedIso: new Date().toISOString(),
            }
          })
          mirrorToIdb()
          void syncDeviceNotifications(get().tasks, get().reminderConfig)
          return id
        },

        updateTask: (taskId, patch) => {
          set((s) => ({
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
          void syncDeviceNotifications(get().tasks, get().reminderConfig)
        },

        deleteTask: (taskId) => {
          set((s) => ({
            tasks: s.tasks.filter((t) => t.id !== taskId),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
          void syncDeviceNotifications(get().tasks, get().reminderConfig)
        },

        moveTaskStatus: (taskId, status) => {
          set((s) => ({
            tasks: s.tasks.map((t) => {
              if (t.id !== taskId) return t
              const isDone = status === 'COMPLETED'
              return {
                ...t,
                status,
                manualProgress: isDone ? 100 : t.manualProgress,
                completedAtIso: isDone ? new Date().toISOString() : null,
                isEatThatFrog: isDone ? false : t.isEatThatFrog,
              }
            }),
            completedDates: status === 'COMPLETED' ? markTodayActive(s.completedDates) : s.completedDates,
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
          void syncDeviceNotifications(get().tasks, get().reminderConfig)
        },

        toggleEatThatFrog: (taskId) => {
          set((s) => {
            const target = s.tasks.find((t) => t.id === taskId)
            const nextVal = !target?.isEatThatFrog
            return {
              tasks: s.tasks.map((t) => ({
                ...t,
                isEatThatFrog: t.id === taskId ? nextVal : false,
                status: t.id === taskId && nextVal && t.status === 'BACKLOG' ? 'IN_PROGRESS' : t.status,
              })),
              lastBackupSyncedIso: new Date().toISOString(),
            }
          })
          mirrorToIdb()
        },

        setOneThreeFiveSlot: (taskId, slot) => {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    oneThreeFiveSlot: slot,
                    status: slot !== null && t.status === 'BACKLOG' ? 'IN_PROGRESS' : t.status,
                  }
                : t
            ),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        setIvyLeeRank: (taskId, rank) => {
          set((s) => {
            const clampedRank =
              rank === null ? null : Math.max(1, Math.min(IVY_LEE_MAX_ITEMS, Math.round(rank)))
            return {
              tasks: s.tasks.map((t) => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    ivyLeeRank: clampedRank,
                    status: clampedRank !== null && t.status === 'BACKLOG' ? 'IN_PROGRESS' : t.status,
                  }
                }
                if (clampedRank !== null && t.ivyLeeRank === clampedRank) {
                  return { ...t, ivyLeeRank: null }
                }
                return t
              }),
              lastBackupSyncedIso: new Date().toISOString(),
            }
          })
          mirrorToIdb()
        },

        setTaskQuadrant: (taskId, isImportant, isUrgentOverride) => {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    isImportant,
                    isUrgentOverride,
                    status: isImportant && isUrgentOverride && t.status === 'BACKLOG' ? 'IN_PROGRESS' : t.status,
                  }
                : t
            ),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        autoChunkTask: (taskId) => {
          set((s) => ({
            tasks: s.tasks.map((t) => {
              if (t.id !== taskId) return t
              const generated = generateChunkedSubtasks(t.scale, t.category, t.title)
              return {
                ...t,
                subtasks: generated,
              }
            }),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        applyAdaptivePlan: (taskId, steps) => {
          set((s) => ({
            tasks: s.tasks.map((t) => {
              if (t.id !== taskId) return t
              const newSubtasks: SubtaskItem[] = steps.map((st, idx) => ({
                id: `sub-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
                title: st.title,
                completed: false,
                isParetoCore: st.isParetoCore,
              }))
              return {
                ...t,
                subtasks: newSubtasks,
              }
            }),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        addSubtask: (taskId, title, isParetoCore = false) => {
          const clean = title.trim()
          if (!clean) return
          const newSub: SubtaskItem = {
            id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            title: clean,
            completed: false,
            isParetoCore,
          }
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t
            ),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        toggleSubtask: (taskId, subtaskId) => {
          set((s) => ({
            tasks: s.tasks.map((t) => {
              if (t.id !== taskId) return t
              const updatedSubs = t.subtasks.map((sub) =>
                sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
              )
              const pct = calcTaskProgress({
                subtasks: updatedSubs,
                manualProgress: t.manualProgress,
                status: 'IN_PROGRESS',
              })
              return {
                ...t,
                subtasks: updatedSubs,
                manualProgress: pct,
              }
            }),
            completedDates: markTodayActive(s.completedDates),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        toggleSubtaskPareto: (taskId, subtaskId) => {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    subtasks: t.subtasks.map((sub) =>
                      sub.id === subtaskId ? { ...sub, isParetoCore: !sub.isParetoCore } : sub
                    ),
                  }
                : t
            ),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        deleteSubtask: (taskId, subtaskId) => {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? { ...t, subtasks: t.subtasks.filter((sub) => sub.id !== subtaskId) }
                : t
            ),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        completeTaskVia85Rule: (taskId) => {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: 'COMPLETED',
                    completedVia85Rule: true,
                    manualProgress: 100,
                    completedAtIso: new Date().toISOString(),
                    isEatThatFrog: false,
                  }
                : t
            ),
            completedDates: markTodayActive(s.completedDates),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
          void syncDeviceNotifications(get().tasks, get().reminderConfig)
        },

        updateWoopNote: (taskId, woop) => {
          set((s) => ({
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, woop } : t)),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        updateStudyNotes: (taskId, studyNotes) => {
          set((s) => ({
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, studyNotes } : t)),
            completedDates: markTodayActive(s.completedDates),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        logFocusSession: (taskId, minutes, isPomodoro) => {
          set((s) => ({
            tasks: s.tasks.map((t) => {
              if (t.id !== taskId) return t
              const boostedProgress =
                t.subtasks.length === 0 ? Math.min(100, t.manualProgress + 15) : t.manualProgress
              return {
                ...t,
                status: t.status === 'BACKLOG' ? 'IN_PROGRESS' : t.status,
                focusMinutesLogged: t.focusMinutesLogged + minutes,
                pomodoroCount: isPomodoro ? t.pomodoroCount + 1 : t.pomodoroCount,
                manualProgress: boostedProgress,
              }
            }),
            completedDates: markTodayActive(s.completedDates),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
        },

        updateReminderConfig: (patch) => {
          set((s) => ({
            reminderConfig: { ...s.reminderConfig, ...patch },
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
          void syncDeviceNotifications(get().tasks, get().reminderConfig)
        },

        triggerSampleNotification: (customTitle, customBody, relatedTaskId) => {
          const s = get()
          const sample =
            customTitle && customBody
              ? {
                  id: `sim-${Date.now()}`,
                  title: customTitle,
                  body: customBody,
                  tag: 'CUSTOM_ALERT',
                  triggeredAtIso: new Date().toISOString(),
                  relatedTaskId,
                }
              : createImmediateSampleNotification(s.tasks, s.reminderConfig)

          fireInstantBrowserNotification(sample.title, sample.body)
          set((prev) => ({
            simulatedNotifications: [sample, ...prev.simulatedNotifications].slice(0, 5),
          }))
        },

        dismissSimulatedNotification: (id) => {
          set((s) => ({
            simulatedNotifications: s.simulatedNotifications.filter((n) => n.id !== id),
          }))
        },

        exportBackupPayload: () => buildBackupSnapshot(get()),

        importBackupPayload: (payload) => {
          set({
            participantName: payload.participantName || 'Peserta Jadwal-In',
            characterId: payload.characterId || 'CHR-01',
            tasks: payload.tasks,
            completedDates: payload.completedDates || [formatDateYmd()],
            reminderConfig: payload.reminderConfig || DEFAULT_HABIT_REMINDER_CONFIG,
            gameCommitment: payload.gameCommitment ?? null,
            lastBackupSyncedIso: new Date().toISOString(),
          })
          mirrorToIdb()
          void syncDeviceNotifications(payload.tasks, payload.reminderConfig || DEFAULT_HABIT_REMINDER_CONFIG)
        },

        importGameCommitment: (commitment) => {
          set({
            characterId: commitment.characterId,
            gameCommitment: commitment,
            lastBackupSyncedIso: new Date().toISOString(),
          })
          mirrorToIdb()
        },

        recoverFromIndexedDbIfNeeded: async () => {
          const current = get()
          if (current.tasks.length > 0) {
            void saveSnapshotToIndexedDb(buildBackupSnapshot(current))
            return false
          }
          const idbBackup = await loadSnapshotFromIndexedDb()
          if (idbBackup && idbBackup.tasks.length > 0) {
            get().importBackupPayload(idbBackup)
            return true
          }
          return false
        },
      }
    },
    {
      name: 'jadwalin-mobile-v1',
      version: 1,
      storage: createJSONStorage((): StateStorage => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage
        }
        const mem = new Map<string, string>()
        return {
          getItem: (k) => mem.get(k) ?? null,
          setItem: (k, v) => {
            mem.set(k, v)
          },
          removeItem: (k) => {
            mem.delete(k)
          },
        }
      }),
    }
  )
)
