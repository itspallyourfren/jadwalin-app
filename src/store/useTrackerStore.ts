// src/store/useTrackerStore.ts - Zustand Store with Dual-Storage Resilience (localStorage + IndexedDB)
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { DEFAULT_HABIT_REMINDER_CONFIG, IVY_LEE_MAX_ITEMS } from '../data/constants'
import { calcTaskProgress, generateChunkedSubtasks } from '../engine/boardFrameworksEngine'
import { createImmediateSampleNotification } from '../engine/notificationScheduler'
import { formatDateYmd } from '../engine/studyAndTimerEngine'
import { setAudioEnabled, soundFx } from '../lib/audioService'
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
  UserProcrastinationProfile,
  WoopNote,
} from '../data/types'
import { generateStarterTaskForProfile } from '../engine/procrastinationDiagnosticEngine'
import {
  pushBackupToCloud,
  pullBackupFromCloud,
  scheduleDebouncedCloudSync,
} from '../lib/cloudSyncService'

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
  tasks: TrackerTask[]
  completedDates: string[]
  reminderConfig: HabitReminderConfig
  gameCommitment: ImportedGameCommitment | null
  simulatedNotifications: SimulatedNotificationItem[]
  lastBackupSyncedIso: string | null
  hasCompletedDiagnosis: boolean
  userProfile: UserProcrastinationProfile | null
  soundEnabled: boolean
  cloudSyncCode: string | null
  lastCloudSyncIso: string | null
  isCloudAutoSyncEnabled: boolean

  // Actions
  setParticipantProfile: (name: string, characterId: CharacterId) => void
  setActiveBoardView: (view: BoardFrameworkView) => void
  setActiveMobileKanbanTab: (tab: KanbanStatus) => void
  setActiveTimeFilter: (filter: TimeBlockTag | 'ALL') => void
  setIvyLeeSingleFocusMode: (enabled: boolean) => void
  toggleSound: () => void
  setSoundEnabled: (enabled: boolean) => void

  addTask: (input: NewTaskInput) => string
  updateTask: (taskId: string, patch: Partial<TrackerTask>) => void
  deleteTask: (taskId: string) => void
  clearAllTasks: () => void
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
  saveDiagnosisResult: (profile: UserProcrastinationProfile, createStarterTask?: boolean) => void
  resetDiagnosis: () => void

  exportBackupPayload: () => MobileBackupPayload
  importBackupPayload: (payload: MobileBackupPayload) => void
  importGameCommitment: (commitment: ImportedGameCommitment) => void
  recoverFromIndexedDbIfNeeded: () => Promise<boolean>

  setCloudSyncInfo: (code: string | null, syncedIso?: string | null) => void
  setCloudAutoSyncEnabled: (enabled: boolean) => void
  syncWithCloud: () => Promise<{ success: boolean; syncCode?: string; error?: string }>
  restoreFromCloud: (syncCode: string) => Promise<{ success: boolean; error?: string }>
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
    userProfile: state.userProfile,
  }
}

const fallbackMemoryStorage = new Map<string, string>()

export const useTrackerStore = create<TrackerStoreState>()(
  persist(
    (set, get) => {
      const mirrorToIdb = () => {
        const snapshot = buildBackupSnapshot(get())
        void saveSnapshotToIndexedDb(snapshot)
        const st = get()
        if (st.isCloudAutoSyncEnabled && st.cloudSyncCode) {
          scheduleDebouncedCloudSync(() => {
            void get().syncWithCloud()
          }, 4000)
        }
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
        tasks: [],
        completedDates: [formatDateYmd()],
        reminderConfig: DEFAULT_HABIT_REMINDER_CONFIG,
        gameCommitment: null,
        simulatedNotifications: [],
        lastBackupSyncedIso: new Date().toISOString(),
        hasCompletedDiagnosis: false,
        userProfile: null,
        soundEnabled: true,
        cloudSyncCode: null,
        lastCloudSyncIso: null,
        isCloudAutoSyncEnabled: false,

        setParticipantProfile: (participantName, characterId) => {
          set({ participantName, characterId, lastBackupSyncedIso: new Date().toISOString() })
          mirrorToIdb()
        },

        setActiveBoardView: (activeBoardView) => set({ activeBoardView }),
        setActiveMobileKanbanTab: (activeMobileKanbanTab) => set({ activeMobileKanbanTab }),
        setActiveTimeFilter: (activeTimeFilter) => set({ activeTimeFilter }),
        setIvyLeeSingleFocusMode: (ivyLeeSingleFocusMode) => set({ ivyLeeSingleFocusMode }),
        toggleSound: () =>
          set((s) => {
            const next = !s.soundEnabled
            setAudioEnabled(next)
            return { soundEnabled: next }
          }),
        setSoundEnabled: (soundEnabled) => {
          setAudioEnabled(soundEnabled)
          set({ soundEnabled })
        },

        addTask: (input) => {
          const id = `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          const scale = input.scale
          const category = input.category
          const targetStatus: KanbanStatus = input.status ?? 'IN_PROGRESS'
          const subtasks = input.autoChunk
            ? generateChunkedSubtasks(scale, category, input.title)
            : []

          const newTask: TrackerTask = {
            id,
            title: input.title.trim(),
            courseOrContext: input.courseOrContext.trim() || 'Umum',
            category,
            scale,
            status: targetStatus,
            timeBlock: input.timeBlock ?? 'Pagi',
            deadlineIso: input.deadlineIso ?? null,
            internalDeadlineIso: input.internalDeadlineIso ?? null,
            isImportant: input.isImportant ?? (scale === 'Besar'),
            isUrgentOverride: null,
            isEatThatFrog: Boolean(input.isEatThatFrog),
            ivyLeeRank: null,
            oneThreeFiveSlot:
              scale === 'Besar'
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
              activeMobileKanbanTab: targetStatus,
              activeTimeFilter:
                s.activeTimeFilter !== 'ALL' && s.activeTimeFilter !== newTask.timeBlock
                  ? 'ALL'
                  : s.activeTimeFilter,
              lastBackupSyncedIso: new Date().toISOString(),
            }
          })
          mirrorToIdb()
          void syncDeviceNotifications(get().tasks, get().reminderConfig)
          get().triggerSampleNotification(
            'Tugas Berhasil Disimpan',
            `"${newTask.title}" siap dikerjakan di ${
              targetStatus === 'BACKLOG' ? 'Laci Tugas' : 'Fokus Hari Ini'
            }.`,
            id
          )
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
          soundFx.delete()
          set((s) => ({
            tasks: s.tasks.filter((t) => t.id !== taskId),
            lastBackupSyncedIso: new Date().toISOString(),
          }))
          mirrorToIdb()
          void syncDeviceNotifications(get().tasks, get().reminderConfig)
        },

        clearAllTasks: () => {
          set({
            tasks: [],
            lastBackupSyncedIso: new Date().toISOString(),
          })
          mirrorToIdb()
          void syncDeviceNotifications([], get().reminderConfig)
        },

        moveTaskStatus: (taskId, status) => {
          if (status === 'COMPLETED') {
            soundFx.complete()
          }
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
          const currentTask = get().tasks.find((t) => t.id === taskId)
          const targetSub = currentTask?.subtasks.find((s) => s.id === subtaskId)
          if (targetSub) {
            if (!targetSub.completed) {
              soundFx.check()
            } else {
              soundFx.uncheck()
            }
          }

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
          soundFx.complete()
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
          soundFx.notification()
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

        saveDiagnosisResult: (profile, createStarterTask = false) => {
          set({
            hasCompletedDiagnosis: true,
            userProfile: profile,
            activeBoardView: profile.recommendedFramework,
            lastBackupSyncedIso: new Date().toISOString(),
          })
          if (createStarterTask) {
            const starterTask = generateStarterTaskForProfile(profile)
            get().addTask(starterTask)
          }
          mirrorToIdb()
        },

        resetDiagnosis: () => {
          set({
            hasCompletedDiagnosis: false,
            userProfile: null,
            lastBackupSyncedIso: new Date().toISOString(),
          })
          mirrorToIdb()
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
            userProfile: payload.userProfile ?? null,
            hasCompletedDiagnosis: Boolean(payload.userProfile),
            activeBoardView: payload.userProfile?.recommendedFramework ?? 'KANBAN',
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
          // Purge any legacy starter dummy tasks cached in memory/localStorage
          if (current.tasks.some((t) => t.id.startsWith('starter-'))) {
            const cleaned = current.tasks.filter((t) => !t.id.startsWith('starter-'))
            set({ tasks: cleaned })
          }

          if (get().tasks.length > 0) {
            void saveSnapshotToIndexedDb(buildBackupSnapshot(get()))
            return false
          }

          const idbBackup = await loadSnapshotFromIndexedDb()
          if (idbBackup && idbBackup.tasks.length > 0) {
            const cleanTasks = idbBackup.tasks.filter((t) => !t.id.startsWith('starter-'))
            if (cleanTasks.length > 0) {
              get().importBackupPayload({ ...idbBackup, tasks: cleanTasks })
              return true
            }
          }
          return false
        },

        setCloudSyncInfo: (cloudSyncCode, lastCloudSyncIso = new Date().toISOString()) => {
          set({ cloudSyncCode, lastCloudSyncIso })
          mirrorToIdb()
        },

        setCloudAutoSyncEnabled: (isCloudAutoSyncEnabled) => {
          set({ isCloudAutoSyncEnabled })
          mirrorToIdb()
        },

        syncWithCloud: async () => {
          const state = get()
          const payload = state.exportBackupPayload()
          const res = await pushBackupToCloud(payload, state.participantName, state.cloudSyncCode)
          if (res.success && res.syncCode) {
            set({
              cloudSyncCode: res.syncCode,
              lastCloudSyncIso: res.updatedAtIso || new Date().toISOString(),
              isCloudAutoSyncEnabled: true,
            })
            mirrorToIdb()
          }
          return res
        },

        restoreFromCloud: async (syncCode: string) => {
          const res = await pullBackupFromCloud(syncCode)
          if (res.success && res.payload) {
            get().importBackupPayload(res.payload)
            set({
              cloudSyncCode: res.syncCode || syncCode.trim().toUpperCase(),
              lastCloudSyncIso: res.updatedAtIso || new Date().toISOString(),
              isCloudAutoSyncEnabled: true,
            })
            mirrorToIdb()
            return { success: true }
          }
          return { success: false, error: res.error }
        },
      }
    },
    {
      name: 'jadwalin-mobile-v1',
      version: 2,
      skipHydration: true,
      migrate: (persistedState: unknown) => {
        const state = (persistedState && typeof persistedState === 'object'
          ? persistedState
          : {}) as Partial<TrackerStoreState>
        // Purge legacy starter tasks from existing persisted state
        const tasks = Array.isArray(state.tasks)
          ? state.tasks.filter((t: TrackerTask) => !t.id?.startsWith('starter-'))
          : []
        return {
          ...state,
          tasks,
        }
      },
      storage: createJSONStorage((): StateStorage => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage
        }
        return {
          getItem: (k) => fallbackMemoryStorage.get(k) ?? null,
          setItem: (k, v) => {
            fallbackMemoryStorage.set(k, v)
          },
          removeItem: (k) => {
            fallbackMemoryStorage.delete(k)
          },
        }
      }),
    }
  )
)
