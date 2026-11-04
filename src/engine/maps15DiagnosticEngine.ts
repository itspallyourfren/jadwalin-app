// src/engine/maps15DiagnosticEngine.ts - Pure Psychological Engine for MAPS-15 & Adaptive Profile Synthesis
import type {
  AppExpectationGoal,
  BoardFrameworkView,
  Maps15Assessment,
  Maps15Dimension,
  PreferredFocusStyle,
  PrimaryAcademicGoal,
  ProcrastinationArchetype,
  TaskScale,
  TechniqueId,
  TrackerTask,
  UserProcrastinationProfile,
} from '../data/types'

export type Maps15Item = {
  id: number
  dimension: Maps15Dimension
  text: string
  isReverse: boolean
  dimensionLabel: string
}

// MAPS-15 Versi Indonesia (Taqiyah & Syahputra, 2025)
// CP = Core Procrastination (4, 5, 6, 7, 11, 13)
// PTM = Poor Time Management (2, 8, 9, 12)
// WD = Work Disconnection (1, 3, 10, 14, 15)
// Unfavorable / Reverse: 8, 9, 12, 13 (Formula: 6 - skor)
export const MAPS_15_ITEMS: Maps15Item[] = [
  {
    id: 1,
    dimension: 'WD',
    text: 'Saya mengerjakan tugas secara tidak sistematis',
    isReverse: false,
    dimensionLabel: 'Fokus & Distraksi',
  },
  {
    id: 2,
    dimension: 'PTM',
    text: 'Saya selalu terlambat menyelesaikan tugas saya',
    isReverse: false,
    dimensionLabel: 'Atur Waktu',
  },
  {
    id: 3,
    dimension: 'WD',
    text: 'Saya selalu menyela mengerjakan tugas dengan hal lain (nongkrong, medsos, ngobrol)',
    isReverse: false,
    dimensionLabel: 'Fokus & Distraksi',
  },
  {
    id: 4,
    dimension: 'CP',
    text: 'Saya tidak terlalu peduli dengan pendidikan saya',
    isReverse: false,
    dimensionLabel: 'Memulai Tugas',
  },
  {
    id: 5,
    dimension: 'CP',
    text: 'Saya mengerjakan tugas semaunya',
    isReverse: false,
    dimensionLabel: 'Memulai Tugas',
  },
  {
    id: 6,
    dimension: 'CP',
    text: 'Saya ingin mendapatkan nilai yang baik dari hasil pengerjaan saya',
    isReverse: false,
    dimensionLabel: 'Memulai Tugas',
  },
  {
    id: 7,
    dimension: 'CP',
    text: 'Saya kesulitan untuk memulai belajar',
    isReverse: false,
    dimensionLabel: 'Memulai Tugas',
  },
  {
    id: 8,
    dimension: 'PTM',
    text: 'Saya memiliki rutinitas belajar yang selalu saya lakukan',
    isReverse: true,
    dimensionLabel: 'Atur Waktu',
  },
  {
    id: 9,
    dimension: 'PTM',
    text: 'Saya selalu mengutamakan pendidikan saya',
    isReverse: true,
    dimensionLabel: 'Atur Waktu',
  },
  {
    id: 10,
    dimension: 'WD',
    text: 'Saya biasanya menunda belajar karena merasa punya banyak waktu untuk melakukannya nanti',
    isReverse: false,
    dimensionLabel: 'Fokus & Distraksi',
  },
  {
    id: 11,
    dimension: 'CP',
    text: 'Saya biasanya beranggapan bisa menyelesaikan pekerjaan dalam waktu cepat, meskipun kenyataannya tidak',
    isReverse: false,
    dimensionLabel: 'Memulai Tugas',
  },
  {
    id: 12,
    dimension: 'PTM',
    text: 'Saya biasanya dapat mempelajari segala sesuatu yang sudah saya rancang untuk satu sesi belajar',
    isReverse: true,
    dimensionLabel: 'Atur Waktu',
  },
  {
    id: 13,
    dimension: 'CP',
    text: 'Saya cenderung belajar daripada melakukan hal-hal yang mungkin lebih saya sukai',
    isReverse: true,
    dimensionLabel: 'Memulai Tugas',
  },
  {
    id: 14,
    dimension: 'WD',
    text: 'Ketika saya belajar dan bersiap ujian, saya justru menghabiskan waktu untuk melakukan hal-hal lain',
    isReverse: false,
    dimensionLabel: 'Fokus & Distraksi',
  },
  {
    id: 15,
    dimension: 'WD',
    text: 'Ketika saya belajar, saya menghabiskan banyak waktu untuk hal tidak penting sebelum tugas utama selesai',
    isReverse: false,
    dimensionLabel: 'Fokus & Distraksi',
  },
]

/**
 * Pengacakan urutan butir MAPS-15 agar menghilangkan bias urutan (response order bias).
 * Menerima seed opsional untuk pengujian deterministik.
 */
export function shuffleMaps15Items(seed?: number): Maps15Item[] {
  const items = [...MAPS_15_ITEMS]
  let currentSeed = seed !== undefined ? seed : Date.now()

  const random = () => {
    if (seed !== undefined) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280
      return currentSeed / 233280
    }
    return Math.random()
  }

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const temp = items[i]
    items[i] = items[j]
    items[j] = temp
  }

  return items
}

const resolveLevel = (normalized: number): 'Rendah' | 'Sedang' | 'Tinggi' => {
  if (normalized < 40) return 'Rendah'
  if (normalized <= 65) return 'Sedang'
  return 'Tinggi'
}

/**
 * Menghitung skor MAPS-15 murni, termasuk pembalikan skor butir unfavourable (8, 9, 12, 13).
 */
export function evaluateMaps15Responses(
  responses: Record<number, number>,
  answeredAtIso: string = new Date().toISOString()
): Maps15Assessment {
  let cpRaw = 0
  let ptmRaw = 0
  let wdRaw = 0

  for (const item of MAPS_15_ITEMS) {
    const rawVal = responses[item.id] ?? 3
    const clampedVal = Math.max(1, Math.min(5, Math.round(rawVal)))
    const effectiveVal = item.isReverse ? 6 - clampedVal : clampedVal

    if (item.dimension === 'CP') cpRaw += effectiveVal
    else if (item.dimension === 'PTM') ptmRaw += effectiveVal
    else if (item.dimension === 'WD') wdRaw += effectiveVal
  }

  // CP: 6 items (min 6, max 30) -> range 24
  const cpNormalized = Math.round(Math.max(0, Math.min(100, ((cpRaw - 6) / 24) * 100)))
  // PTM: 4 items (min 4, max 20) -> range 16
  const ptmNormalized = Math.round(Math.max(0, Math.min(100, ((ptmRaw - 4) / 16) * 100)))
  // WD: 5 items (min 5, max 25) -> range 20
  const wdNormalized = Math.round(Math.max(0, Math.min(100, ((wdRaw - 5) / 20) * 100)))

  const totalScore = cpRaw + ptmRaw + wdRaw
  // Total: 15 items (min 15, max 75) -> range 60
  const normalizedScore = Math.round(Math.max(0, Math.min(100, ((totalScore - 15) / 60) * 100)))

  // Menentukan dimensi yang paling dominan bermasalah
  let dominantDimension: Maps15Dimension = 'WD'
  const maxScore = Math.max(cpNormalized, ptmNormalized, wdNormalized)
  if (maxScore === cpNormalized) {
    dominantDimension = 'CP'
  } else if (maxScore === ptmNormalized) {
    dominantDimension = 'PTM'
  } else {
    dominantDimension = 'WD'
  }

  return {
    answeredAtIso,
    totalScore,
    normalizedScore,
    cpScore: cpRaw,
    ptmScore: ptmRaw,
    wdScore: wdRaw,
    cpNormalized,
    ptmNormalized,
    wdNormalized,
    dominantDimension,
    dimensionLabels: {
      cp: resolveLevel(cpNormalized),
      ptm: resolveLevel(ptmNormalized),
      wd: resolveLevel(wdNormalized),
    },
    rawResponses: { ...responses },
  }
}

export type SynthesisInput = {
  userName: string
  personalGoal: PrimaryAcademicGoal
  personalObstacle: ProcrastinationArchetype
  appExpectation: AppExpectationGoal
  maps15Assessment: Maps15Assessment
}

/**
 * Mensintesis Profil Prokrastinasi Lengkap:
 * Menggabungkan Kondisi Personal + Asesmen MAPS-15 + Harapan Aplikasi
 */
export function synthesizeProcrastinationProfile(
  input: SynthesisInput
): UserProcrastinationProfile {
  const { personalGoal, personalObstacle, appExpectation, maps15Assessment } = input

  let recommendedFramework: BoardFrameworkView = 'KANBAN'
  let focusStyle: PreferredFocusStyle = 'POMODORO'
  const techSet = new Set<TechniqueId>()

  // 1. Rekomendasi berdasarkan Harapan Aplikasi (Prioritas Utama Pengguna)
  switch (appExpectation) {
    case 'BREAK_BIG_TASKS':
      recommendedFramework = 'KANBAN'
      focusStyle = 'TEN_MIN'
      techSet.add('TEK_02') // Task Chunking
      techSet.add('TEK_10') // Prinsip Pareto 80/20
      techSet.add('TEK_04') // The Zeigarnik Effect
      techSet.add('TEK_08') // The 10-Minute Rule
      break

    case 'BEAT_DISTRACTIONS':
      recommendedFramework = 'KANBAN'
      focusStyle = 'POMODORO'
      techSet.add('TEK_01') // Pomodoro Technique
      techSet.add('TEK_07') // Ulysses Pact
      techSet.add('TEK_03') // Temptation Bundling
      techSet.add('TEK_29') // Flow State Sprint
      break

    case 'BUILD_ROUTINE':
      recommendedFramework = 'IVY_LEE'
      focusStyle = 'FLEXIBLE'
      techSet.add('TEK_28') // Ivy Lee Method
      techSet.add('TEK_11') // The 1-3-5 Rule
      techSet.add('TEK_12') // Time Blocking
      techSet.add('TEK_35') // Habit Stacking
      break

    case 'REDUCE_ANXIETY_DEADLINE':
      recommendedFramework = 'EISENHOWER'
      focusStyle = 'TEN_MIN'
      techSet.add('TEK_06') // The 85% Rule
      techSet.add('TEK_13') // WOOP Framework
      techSet.add('TEK_09') // Eat That Frog!
      techSet.add('TEK_31') // 5-Second Rule
      break
  }

  // 2. Modulasi Tambahan dari Dimensi Dominan MAPS-15
  if (maps15Assessment.dominantDimension === 'WD') {
    techSet.add('TEK_01') // Pomodoro Technique
    techSet.add('TEK_07') // Ulysses Pact
  } else if (maps15Assessment.dominantDimension === 'PTM') {
    techSet.add('TEK_12') // Time Blocking
    techSet.add('TEK_28') // Ivy Lee Method
  } else if (maps15Assessment.dominantDimension === 'CP') {
    techSet.add('TEK_08') // The 10-Minute Rule
    techSet.add('TEK_31') // 5-Second Rule
  }

  // 3. Modulasi Tambahan dari Rintangan Emosional Personal (Diprioritaskan ke Depan)
  const prioritizedTechs: TechniqueId[] = []
  if (personalObstacle === 'PERFECTIONIST') {
    prioritizedTechs.push('TEK_06') // The 85% Rule
  } else if (personalObstacle === 'DEADLINER') {
    prioritizedTechs.push('TEK_34') // Hukum Parkinson
  } else if (personalObstacle === 'OVERWHELMED') {
    prioritizedTechs.push('TEK_08') // 10-Minute Rule
  } else if (personalObstacle === 'DISTRACTED') {
    prioritizedTechs.push('TEK_07') // Ulysses Pact
  }

  const allTechs = Array.from(new Set([...prioritizedTechs, ...techSet]))
  const recommendedTechniqueIds = allTechs.slice(0, 4)

  return {
    archetype: personalObstacle,
    primaryGoal: personalGoal,
    focusStyle,
    appExpectation,
    maps15: maps15Assessment,
    recommendedFramework,
    recommendedTechniqueIds,
    diagnosedAtIso: new Date().toISOString(),
  }
}

/**
 * Menghasilkan target tugas perdana yang relevan dengan situasi akademik pengguna.
 */
export function generateTailoredStarterTask(
  profile: UserProcrastinationProfile,
  _userName: string = 'Kamu'
): TrackerTask {
  const goal = profile.primaryGoal
  const expectation = profile.appExpectation

  let title = 'Langkah Awal: Susun Kerangka Makalah'
  let context = 'Mata Kuliah Utama'
  let scale: TaskScale = 'Sedang'

  if (goal === 'THESIS') {
    title = 'Draf Awal: Kerangka Bab Pendahuluan Skripsi'
    context = 'Skripsi & Tugas Akhir'
    scale = 'Besar'
  } else if (goal === 'EXAMS') {
    title = 'Rangkuman Materi & Pemetaan Topik Ujian'
    context = 'Persiapan Ujian'
    scale = 'Sedang'
  } else if (goal === 'ROUTINE') {
    title = 'Atur 3 Target Prioritas untuk Hari Ini'
    context = 'Rutinitas Kampus'
    scale = 'Kecil'
  }

  const starterSubs = [
    {
      id: `sub-${Date.now()}-1`,
      title: 'Buka lembar dokumen kerja kosong & ketik judul utama (2 menit)',
      completed: false,
      isParetoCore: true,
      isZeigarnikStarter: true,
    },
    {
      id: `sub-${Date.now()}-2`,
      title: 'Tulis 3 poin bahasan utama tanpa memikirkan kerapihan kalimat',
      completed: false,
      isParetoCore: true,
      isZeigarnikStarter: false,
    },
    {
      id: `sub-${Date.now()}-3`,
      title: 'Nyalakan timer fokus 15 menit dan jauhkan gawai/HP',
      completed: false,
      isParetoCore: false,
      isZeigarnikStarter: false,
    },
  ]

  return {
    id: `task-starter-${Date.now()}`,
    title,
    courseOrContext: context,
    category: goal === 'THESIS' ? 'Kuliah & Tugas' : 'Belajar & Ujian',
    scale,
    status: 'IN_PROGRESS',
    timeBlock: 'Pagi',
    deadlineIso: new Date(Date.now() + 7 * 86400000).toISOString(),
    internalDeadlineIso: new Date(Date.now() + 3 * 86400000).toISOString(),
    isImportant: true,
    isUrgentOverride: false,
    isEatThatFrog: true,
    ivyLeeRank: 1,
    oneThreeFiveSlot: scale === 'Besar' ? 'LARGE_1' : 'MEDIUM_3',
    subtasks: starterSubs,
    manualProgress: 0,
    completedVia85Rule: false,
    woop: {
      wish: `Menuntaskan langkah pertama ${title}`,
      outcome: 'Pikiran terasa jauh lebih lega dan beban psikologis langsung berkurang',
      obstacle:
        expectation === 'BEAT_DISTRACTIONS'
          ? 'Tangan reflek ingin membuka media sosial atau notifikasi HP'
          : 'Merasa malas memulai karena membayangkan tugas terlalu berat',
      ifThenPlan:
        expectation === 'BEAT_DISTRACTIONS'
          ? 'Jika tangan ingin meraih HP, MAKA balik layar HP ke bawah dan lakukan hitung 5-4-3-2-1 lalu lanjut mengetik 1 kalimat'
          : 'Jika merasa bingung mulai, MAKA cicil 10 menit saja tanpa memikirkan kesempurnaan hasil',
    },
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
}
