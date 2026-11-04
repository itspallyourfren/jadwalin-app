// src/engine/procrastinationDiagnosticEngine.ts - Academic Procrastination Diagnostic & Personalization Engine
import type {
  BoardFrameworkView,
  PrimaryAcademicGoal,
  PreferredFocusStyle,
  ProcrastinationArchetype,
  TechniqueId,
  UserProcrastinationProfile,
} from '../data/types'
import type { NewTaskInput } from '../store/useTrackerStore'

export type DiagnosticAnswers = {
  obstacle: ProcrastinationArchetype
  primaryGoal: PrimaryAcademicGoal
  focusStyle: PreferredFocusStyle
}

export type ArchetypeDetails = {
  archetype: ProcrastinationArchetype
  title: string
  subtitle: string
  coreObstacle: string
  scientificExplanation: string
  recommendedFramework: BoardFrameworkView
  frameworkName: string
  frameworkReason: string
  recommendedTechniqueIds: TechniqueId[]
  dailyMotto: string
}

export const ARCHETYPE_METADATA: Record<ProcrastinationArchetype, ArchetypeDetails> = {
  OVERWHELMED: {
    archetype: 'OVERWHELMED',
    title: 'Tipe Penuh Beban Pikiran',
    subtitle: 'The Overwhelmed Planner',
    coreObstacle: 'Tugas terlihat terlalu besar, banyak, dan kabur sehingga otak bingung harus mulai dari mana.',
    scientificExplanation:
      'Kapasitas memori kerja (working memory) mengalami cognitive overload ketika melihat puluhan hal sekaligus. Akibatnya amigdala memicu respons freeze (lumpuh sementara).',
    recommendedFramework: 'ONE_THREE_FIVE',
    frameworkName: 'Target 1-3-5',
    frameworkReason:
      'Membatasi meja kerja harianmu hanya pada 1 tugas besar, 3 tugas sedang, dan 5 urusan kecil agar tidak merasa kewalahan.',
    recommendedTechniqueIds: ['TEK_02', 'TEK_04', 'TEK_11'], // Task Chunking, Zeigarnik, 1-3-5
    dailyMotto: 'Hari ini cukup kerjakan 1 bagian kecil. Jangan pikirkan seluruh semesternya sekarang.',
  },
  PERFECTIONIST: {
    archetype: 'PERFECTIONIST',
    title: 'Tipe Perfeksionis & Takut Salah',
    subtitle: 'The Anxious Perfectionist',
    coreObstacle: 'Menunda karena takut hasilnya kurang maksimal, takut dinilai buruk, atau terjebak riset tanpa henti.',
    scientificExplanation:
      'Evaluative concerns perfectionism memicu kecemasan bahwa hasil kerjamu tidak akan memenuhi standar tinggi, sehingga otak memilih menunda agar harga diri terlindungi.',
    recommendedFramework: 'EISENHOWER',
    frameworkName: 'Matriks Eisenhower (Kuadran 2×2)',
    frameworkReason:
      'Membedakan tugas yang benar-benar penting dari detail sepele yang sering kamu otak-atik terlalu lama.',
    recommendedTechniqueIds: ['TEK_06', 'TEK_25', 'TEK_01'], // 85% Rule, Eisenhower, Pomodoro
    dailyMotto: 'Selesai lebih berharga daripada sempurna. Kumpulkan saat sudah 85% optimal!',
  },
  DEADLINER: {
    archetype: 'DEADLINER',
    title: 'Tipe Penakluk Deadline',
    subtitle: 'The Midnight Deadliner (SKS)',
    coreObstacle: 'Baru bisa fokus dan bergerak saat waktu sudah mepet atau malam sebelum pengumpulan tugas.',
    scientificExplanation:
      'Adrenalin lonjakan menit-menit akhir menggantikan motivasi intrinsik. Meski kadang berhasil, pola ini memicu kelelahan fisik, stres tinggi, dan hasil kerja rentan error.',
    recommendedFramework: 'KANBAN',
    frameworkName: 'Papan Kanban dengan Batas Meja',
    frameworkReason:
      'Membatasi jumlah tugas di meja kerja Hari Ini agar kamu memiliki urgensi visual tanpa harus menunggu malam deadline.',
    recommendedTechniqueIds: ['TEK_34', 'TEK_08', 'TEK_09'], // Parkinson Law, 10-Minute, Eat That Frog
    dailyMotto: 'Buat deadline pribadimu sendiri 1 hari lebih awal agar kamu tetap santai saat teman-teman panik.',
  },
  DISTRACTED: {
    archetype: 'DISTRACTED',
    title: 'Tipe Pengelana Fokus',
    subtitle: 'The Distracted Swapper',
    coreObstacle: 'Baru sebentar mencoba fokus, langsung gatal membuka media sosial, chat, atau perhatian melayang.',
    scientificExplanation:
      'Sistem dopamin otak mencari gratifikasi instan yang lebih mudah didapat dari layar gawai daripada tugas akademik yang membutuhkan atensi berkelanjutan.',
    recommendedFramework: 'IVY_LEE',
    frameworkName: 'Antrean Ivy Lee (Fokus Tunggal)',
    frameworkReason:
      'Menyembunyikan semua tugas lain dari layar dan hanya menampilkan prioritas #1 sampai kamu menuntaskannya.',
    recommendedTechniqueIds: ['TEK_28', 'TEK_07', 'TEK_26'], // Ivy Lee, Ulysses Pact, Structured Procrastination
    dailyMotto: 'Kunci godaan gawai sebelum menekan tombol mulai. Satu tugas saja sampai tuntas.',
  },
}

export function evaluateProcrastinationProfile(answers: DiagnosticAnswers): UserProcrastinationProfile {
  const meta = ARCHETYPE_METADATA[answers.obstacle]
  return {
    archetype: answers.obstacle,
    primaryGoal: answers.primaryGoal,
    focusStyle: answers.focusStyle,
    recommendedFramework: meta.recommendedFramework,
    recommendedTechniqueIds: meta.recommendedTechniqueIds,
    diagnosedAtIso: new Date().toISOString(),
  }
}

export function getArchetypeMetadata(archetype: ProcrastinationArchetype): ArchetypeDetails {
  return ARCHETYPE_METADATA[archetype] ?? ARCHETYPE_METADATA.OVERWHELMED
}

export function generateStarterTaskForProfile(profile: UserProcrastinationProfile): NewTaskInput {
  switch (profile.primaryGoal) {
    case 'THESIS':
      return {
        title: 'Buka Draf Skripsi & Buat Kerangka 1 Sub-Bab',
        courseOrContext: 'Skripsi / Tugas Akhir',
        category: 'Kuliah & Tugas',
        scale: 'Tugas Akhir',
        timeBlock: 'Pagi',
        isImportant: true,
        isEatThatFrog: true,
        autoChunk: true,
      }
    case 'COURSEWORK':
      return {
        title: 'Cicil Tugas Laporan Kuliah Mingguan',
        courseOrContext: 'Mata Kuliah Utama',
        category: 'Kuliah & Tugas',
        scale: 'Sedang',
        timeBlock: 'Pagi',
        isImportant: true,
        autoChunk: true,
      }
    case 'EXAMS':
      return {
        title: 'Review 1 Topik Konsep Kuliah & Catat Pertanyaan Kunci',
        courseOrContext: 'Persiapan Ujian',
        category: 'Belajar & Ujian',
        scale: 'Kecil',
        timeBlock: 'Pagi',
        isImportant: true,
        autoChunk: true,
      }
    case 'ROUTINE':
    default:
      return {
        title: 'Merapikan 1 Target Belajar Hari Ini (Mulai 10 Menit)',
        courseOrContext: 'Rutinitas Kampus',
        category: 'Pribadi & Kebiasaan',
        scale: 'Kecil',
        timeBlock: 'Pagi',
        isImportant: true,
        autoChunk: true,
      }
  }
}
