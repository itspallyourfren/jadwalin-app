// src/data/types.ts - Domain Contracts for Jadwal-In! Mobile Companion

export type Phase = 'Pagi' | 'Siang' | 'Sore' | 'Malam'
export type TimeBlockTag = Phase | 'Bebas'
export type TaskScale = 'Kecil' | 'Sedang' | 'Besar' | 'Tugas Akhir'
export type KanbanStatus = 'BACKLOG' | 'IN_PROGRESS' | 'COMPLETED'
export type TaskCategory = 'Kuliah & Tugas' | 'Belajar & Ujian' | 'Organisasi & Proyek' | 'Pribadi & Kebiasaan'

export type BoardFrameworkView = 'KANBAN' | 'EISENHOWER' | 'ONE_THREE_FIVE' | 'IVY_LEE'

export type EisenhowerQuadrant =
  | 'DO_FIRST'      // Penting & Mendesak (Kerjakan Segera)
  | 'SCHEDULE'      // Penting & Tidak Mendesak (Jadwalkan)
  | 'DELEGATE_FAST' // Kurang Penting & Mendesak (Cicil Cepat / Selingan)
  | 'SAVE_LATER'    // Kurang Penting & Tidak Mendesak (Simpan di Laci)

export type TechniqueTier = 'TIER_1_CORE' | 'TIER_2_CONTEXTUAL' | 'TIER_3_STUDY'

export type TechniqueId =
  | 'TEK_01' | 'TEK_02' | 'TEK_03' | 'TEK_04' | 'TEK_05'
  | 'TEK_06' | 'TEK_07' | 'TEK_08' | 'TEK_09' | 'TEK_10'
  | 'TEK_11' | 'TEK_12' | 'TEK_13' | 'TEK_14' | 'TEK_15'
  | 'TEK_16' | 'TEK_17' | 'TEK_18' | 'TEK_19' | 'TEK_20'
  | 'TEK_21' | 'TEK_22' | 'TEK_24' | 'TEK_25' | 'TEK_26'
  | 'TEK_27' | 'TEK_28' | 'TEK_29' | 'TEK_30' | 'TEK_31'
  | 'TEK_32' | 'TEK_33' | 'TEK_34' | 'TEK_35'

export type CharacterId =
  | 'CHR-01' | 'CHR-02' | 'CHR-03' | 'CHR-04' | 'CHR-05' | 'CHR-06'
  | 'CHR-07' | 'CHR-08' | 'CHR-09' | 'CHR-10' | 'CHR-11' | 'CHR-12'

export type SubtaskItem = {
  id: string
  title: string
  completed: boolean
  isParetoCore: boolean // TEK_10 Prinsip Pareto 80/20 (20% langkah paling berdampak)
  isZeigarnikStarter?: boolean // TEK_04 Langkah pembuka < 2 menit
}

export type WoopNote = {
  wish: string
  outcome: string
  obstacle: string // TEK_13 WOOP & TEK_14 Premortem
  ifThenPlan: string
}

export type Sq3rChecklist = {
  survey: boolean
  question: string
  read: boolean
  recite: string
  review: boolean
}

export type LeitnerFlashcard = {
  id: string
  question: string
  answer: string
  box: 1 | 2 | 3 // TEK_20 Leitner System (1: Ulangi Besok, 2: Lumayan, 3: Kuasai)
}

export type StudyCompanionNotes = {
  sq3r: Sq3rChecklist
  feynmanExplanation: string // TEK_15 Metode Feynman & TEK_32 Rubber Duck
  blurtingDump: string // TEK_18 The Blurting Method
  flashcards: LeitnerFlashcard[] // TEK_16 Active Recall & TEK_20 Leitner
}

export type TrackerTask = {
  id: string
  title: string
  courseOrContext: string
  category: TaskCategory
  scale: TaskScale
  status: KanbanStatus
  timeBlock: TimeBlockTag // TEK_12 Time Blocking & TEK_33 Biological Prime Time
  deadlineIso: string | null
  internalDeadlineIso: string | null // TEK_34 Hukum Parkinson (Target selesai pribadi)
  isImportant: boolean // Untuk Matriks Eisenhower (TEK_25)
  isUrgentOverride: boolean | null // null = dihitung otomatis dari deadline
  isEatThatFrog: boolean // TEK_09 Prioritas Pagi Terberat (1 tugas utama)
  ivyLeeRank: number | null // TEK_28 Urutan 1..6
  oneThreeFiveSlot: 'LARGE_1' | 'MEDIUM_3' | 'SMALL_5' | null // TEK_11 The 1-3-5 Rule
  subtasks: SubtaskItem[]
  manualProgress: number // 0..100 jika tidak memiliki subtasks
  completedVia85Rule: boolean // TEK_06 The 85% Rule
  woop: WoopNote
  studyNotes: StudyCompanionNotes
  focusMinutesLogged: number
  pomodoroCount: number
  reminderEnabled: boolean
  createdAtIso: string
  completedAtIso: string | null
}

export type TimerMode =
  | 'TEN_MINUTE_RULE' // TEK_08 10-Minute Rule + TEK_31 5-Second Countdown
  | 'POMODORO_25_5'   // TEK_01 Pomodoro 25/5
  | 'POMODORO_50_10'  // TEK_01 Pomodoro 50/10
  | 'FLOW_SPRINT_45'  // TEK_29 Flow State Sprint 45m
  | 'QUICK_REST_5'    // Istirahat Sejenak 5m

export type PreFlightRitual = {
  ulyssesPhoneAway: boolean // TEK_07 Ulysses Pact
  temptationBundlingReady: boolean // TEK_03 Temptation Bundling
}

export type HabitReminderConfig = {
  enabled: boolean
  morningTime: string // mis. "08:00"
  morningAnchor: string // TEK_35 Habit Stacking: "Setelah sarapan pagi"
  afternoonTime: string // mis. "13:30"
  afternoonAnchor: string
  eveningTime: string // mis. "20:00"
  eveningAnchor: string // "Sebelum istirahat malam (Susun 6 Prioritas Ivy Lee)"
  deadlineRemind24h: boolean
  deadlineRemind2h: boolean
}

export type ImportedGameCommitment = {
  groupCode: string
  characterId: CharacterId
  focusDimension: 'initiation' | 'timeManagement' | 'focusPersistence'
  ifCondition: string
  thenAction: string
  committedCardIds: TechniqueId[]
  archetypeShortCode: string
  importedAtIso: string
}

export type TechniqueCatalogItem = {
  id: TechniqueId
  name: string
  indonesianSubtitle: string
  tier: TechniqueTier
  categoryLabel: 'Perencanaan & Prioritas' | 'Pendobrak Malas & Fokus' | 'Pemecah Tugas & Anti-Perfeksionis' | 'Metode Belajar Aktif' | 'Konsistensi & Kebiasaan'
  timeRequirement: TimeBlockTag
  cardAsset: string
  shortSummary: string
  realWorldSteps: string[]
  linkedActionType:
    | 'VIEW_KANBAN'
    | 'VIEW_EISENHOWER'
    | 'VIEW_135'
    | 'VIEW_IVY_LEE'
    | 'TIMER_10_MIN'
    | 'TIMER_POMODORO'
    | 'TIMER_FLOW'
    | 'ACTION_CHUNK_TASK'
    | 'ACTION_WOOP'
    | 'ACTION_STUDY_NOTES'
    | 'ACTION_HABIT_REMINDER'
}

export type SimulatedNotificationItem = {
  id: string
  title: string
  body: string
  tag: string
  triggeredAtIso: string
  relatedTaskId?: string
}

export type ProcrastinationArchetype = 'OVERWHELMED' | 'PERFECTIONIST' | 'DEADLINER' | 'DISTRACTED'

export type PrimaryAcademicGoal = 'THESIS' | 'COURSEWORK' | 'EXAMS' | 'ROUTINE'

export type PreferredFocusStyle = 'POMODORO' | 'TEN_MIN' | 'FLOW' | 'FLEXIBLE'

export type UserProcrastinationProfile = {
  archetype: ProcrastinationArchetype
  primaryGoal: PrimaryAcademicGoal
  focusStyle: PreferredFocusStyle
  recommendedFramework: BoardFrameworkView
  recommendedTechniqueIds: TechniqueId[]
  diagnosedAtIso: string
}

export type MobileBackupPayload = {
  version: 1
  exportedAtIso: string
  participantName: string
  characterId: CharacterId
  tasks: TrackerTask[]
  completedDates: string[] // YYYY-MM-DD untuk TEK_05 Seinfeld Strategy Streak
  reminderConfig: HabitReminderConfig
  gameCommitment: ImportedGameCommitment | null
  userProfile?: UserProcrastinationProfile | null
}
