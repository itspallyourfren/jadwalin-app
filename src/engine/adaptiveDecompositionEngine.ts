// src/engine/adaptiveDecompositionEngine.ts - Dynamic Rule-Based Expert System for Task Decomposition
import type { TaskCategory, TaskScale, TrackerTask } from '../data/types'

export type TaskDomain =
  | 'WRITING_ACADEMIC'
  | 'EXAM_STUDY'
  | 'CODING_TECH'
  | 'PRESENTATION'
  | 'ADMIN_OPERATIONAL'
  | 'GENERAL_PROJECT'

export type DecompositionPreset = 'BALANCED' | 'URGENT_SPRINT' | 'DEEP_DIVE'

export type TimePressureLevel = 'RELAXED' | 'MODERATE' | 'URGENT'

export type DecomposedStep = {
  id: string
  title: string
  isParetoCore: boolean
  phaseName: string
  estimatedMinutes: number
  starterTrigger?: string
}

export type DecomposedPhase = {
  phaseName: string
  purpose: string
  estimatedMinutes: number
  steps: DecomposedStep[]
}

export type AdaptiveStrategyPlan = {
  domain: TaskDomain
  domainLabel: string
  domainDescription: string
  presetUsed: DecompositionPreset
  timePressureLevel: TimePressureLevel
  totalEstimatedMinutes: number
  recommendedSessions: {
    pomodoroCount: number
    flowSprintCount: number
  }
  recommendedTechniques: Array<{
    name: string
    why: string
  }>
  phases: DecomposedPhase[]
  allSteps: DecomposedStep[]
}

const DOMAIN_KEYWORDS: Record<TaskDomain, string[]> = {
  WRITING_ACADEMIC: [
    'skripsi',
    'tesis',
    'makalah',
    'esai',
    'laporan',
    'bab',
    'resume',
    'artikel',
    'proposal',
    'tinjauan',
    'pustaka',
    'jurnal',
    'naskah',
    'dokumen',
    'paper',
    'draft',
    'tulis',
    'kajian',
    'ringkasan',
  ],
  EXAM_STUDY: [
    'ujian',
    'uts',
    'uas',
    'kuis',
    'belajar',
    'materi',
    'hafal',
    'kisi',
    'tryout',
    'latihan',
    'soal',
    'exam',
    'quiz',
    'test',
    'rumus',
    'baca',
    'modul',
    'silabus',
  ],
  CODING_TECH: [
    'coding',
    'koding',
    'program',
    'bug',
    'api',
    'database',
    'backend',
    'frontend',
    'react',
    'aplikasi',
    'web',
    'deploy',
    'fix',
    'debug',
    'algoritma',
    'fitur',
    'sql',
    'server',
    'git',
    'ui',
    'ux',
    'endpoint',
  ],
  PRESENTATION: [
    'presentasi',
    'ppt',
    'slide',
    'sidang',
    'seminar',
    'pitching',
    'demo',
    'bicara',
    'speech',
    'talk',
    'kolokium',
  ],
  ADMIN_OPERATIONAL: [
    'daftar',
    'formulir',
    'berkas',
    'bayar',
    'krs',
    'transkrip',
    'legalisir',
    'surat',
    'admin',
    'ukt',
    'registrasi',
    'verifikasi',
    'beasiswa',
    'magang',
  ],
  GENERAL_PROJECT: [
    'acara',
    'kepanitiaan',
    'proyek',
    'himpunan',
    'organisasi',
    'event',
    'rencana',
    'kegiatan',
  ],
}

const DOMAIN_LABELS: Record<TaskDomain, { label: string; desc: string }> = {
  WRITING_ACADEMIC: {
    label: 'Penulisan & Riset Akademik',
    desc: 'Fokus pada pemisahan draf kasar dan tahap revisi agar terhindar dari writer’s block.',
  },
  EXAM_STUDY: {
    label: 'Persiapan Ujian & Studi Materi',
    desc: 'Mengutamakan pemahaman konsep sulit dan latihan uji ingatan mandiri (Active Recall).',
  },
  CODING_TECH: {
    label: 'Pengembangan Perangkat Lunak / Proyek Teknis',
    desc: 'Mendahulukan fungsi logika inti paling krusial sebelum memoles estetika antarmuka.',
  },
  PRESENTATION: {
    label: 'Presentasi & Paparan Sidang',
    desc: 'Menyusun alur argumen kunci, visualisasi slide, serta latihan vokal terukur.',
  },
  ADMIN_OPERATIONAL: {
    label: 'Administrasi & Berkas Kampus',
    desc: 'Prosedur satu arah yang efisien untuk menuntaskan syarat tanpa bolak-balik.',
  },
  GENERAL_PROJECT: {
    label: 'Proyek Terstruktur & Umum',
    desc: 'Pendekatan 3 fase adaptif untuk memecah ketidakpastian menjadi tindakan konkret.',
  },
}

export function detectTaskDomain(
  title: string,
  courseOrContext: string,
  category: TaskCategory
): TaskDomain {
  const combinedText = `${title} ${courseOrContext}`.toLowerCase()

  // Match keyword frequency across domains
  let bestDomain: TaskDomain | null = null
  let maxMatches = 0

  for (const [domainKey, keywords] of Object.entries(DOMAIN_KEYWORDS) as Array<
    [TaskDomain, string[]]
  >) {
    const matches = keywords.filter((kw) => combinedText.includes(kw)).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestDomain = domainKey
    }
  }

  if (bestDomain && maxMatches > 0) {
    return bestDomain
  }

  // Fallback by category
  if (category === 'Belajar & Ujian') return 'EXAM_STUDY'
  if (category === 'Kuliah & Tugas') return 'WRITING_ACADEMIC'
  if (category === 'Organisasi & Proyek') return 'GENERAL_PROJECT'
  return 'GENERAL_PROJECT'
}

export function calcTimePressure(
  deadlineIso: string | null,
  internalDeadlineIso: string | null
): TimePressureLevel {
  const targetIso = internalDeadlineIso || deadlineIso
  if (!targetIso) return 'MODERATE'

  const targetTime = new Date(targetIso).getTime()
  const now = Date.now()
  const hoursLeft = (targetTime - now) / (1000 * 3600)

  if (hoursLeft <= 24) return 'URGENT'
  if (hoursLeft <= 72) return 'MODERATE'
  return 'RELAXED'
}

type DecompositionOptions = {
  preset?: DecompositionPreset
}

export function generateAdaptiveTaskPlan(
  task: TrackerTask,
  options: DecompositionOptions = {}
): AdaptiveStrategyPlan {
  const domain = detectTaskDomain(task.title, task.courseOrContext, task.category)
  const timePressure = calcTimePressure(task.deadlineIso, task.internalDeadlineIso)
  const preset = options.preset ?? (timePressure === 'URGENT' ? 'URGENT_SPRINT' : 'BALANCED')

  const domainInfo = DOMAIN_LABELS[domain]

  // Construct Phases dynamically based on Domain, Scale, and Preset
  const rawPhases = buildPhasesForDomain(domain, task.title, task.scale, preset, timePressure)

  // Flatten all steps
  const allSteps: DecomposedStep[] = []
  let totalEstimatedMinutes = 0

  const phases: DecomposedPhase[] = rawPhases.map((phase, pIdx) => {
    let phaseMinutes = 0
    const steps: DecomposedStep[] = phase.stepTemplates.map((tmpl, sIdx) => {
      const stepMinutes = tmpl.minutes
      phaseMinutes += stepMinutes
      totalEstimatedMinutes += stepMinutes

      const stepObj: DecomposedStep = {
        id: `step-${Date.now()}-${pIdx}-${sIdx}`,
        title: tmpl.title,
        isParetoCore: tmpl.isPareto,
        phaseName: phase.name,
        estimatedMinutes: stepMinutes,
        starterTrigger:
          tmpl.starter ||
          (pIdx === 0 && sIdx === 0
            ? 'Buka dokumen atau alat kerja untuk mulai 2 menit.'
            : undefined),
      }
      allSteps.push(stepObj)
      return stepObj
    })

    return {
      phaseName: phase.name,
      purpose: phase.purpose,
      estimatedMinutes: phaseMinutes,
      steps,
    }
  })

  // Recommended Sessions
  const pomodoroCount = Math.max(1, Math.ceil(totalEstimatedMinutes / 25))
  const flowSprintCount = Math.max(1, Math.ceil(totalEstimatedMinutes / 45))

  // Recommended Behavioral Techniques
  const recommendedTechniques = pickRecommendedTechniques(domain, timePressure, task.scale, preset)

  return {
    domain,
    domainLabel: domainInfo.label,
    domainDescription: domainInfo.desc,
    presetUsed: preset,
    timePressureLevel: timePressure,
    totalEstimatedMinutes,
    recommendedSessions: {
      pomodoroCount,
      flowSprintCount,
    },
    recommendedTechniques,
    phases,
    allSteps,
  }
}

type StepTemplate = {
  title: string
  isPareto: boolean
  minutes: number
  starter?: string
}

type PhaseTemplate = {
  name: string
  purpose: string
  stepTemplates: StepTemplate[]
}

function buildPhasesForDomain(
  domain: TaskDomain,
  title: string,
  scale: TaskScale,
  preset: DecompositionPreset,
  timePressure: TimePressureLevel
): PhaseTemplate[] {
  const isSprint = preset === 'URGENT_SPRINT' || timePressure === 'URGENT'
  const isDeep = preset === 'DEEP_DIVE' || scale === 'Tugas Akhir'

  switch (domain) {
    case 'WRITING_ACADEMIC':
      if (isSprint) {
        return [
          {
            name: '1. Inisiasi Cepat (10 Menit Starter)',
            purpose: 'Buka dokumen dan siapkan judul serta 3 poin utama.',
            stepTemplates: [
              {
                title: 'Buka dokumen Word/Docs kosong & tulis kerangka 3 sub-bab',
                isPareto: false,
                minutes: 10,
                starter: 'Buka laptop dan tulis judul saja.',
              },
            ],
          },
          {
            name: '2. Draf Kasar Inti (Pareto 80/20)',
            purpose: 'Tulis substansi utama tanpa berhenti mengedit ejaan.',
            stepTemplates: [
              {
                title: `Tulis paragraf pembuka & argumen utama tentang "${title.slice(0, 32)}"`,
                isPareto: true,
                minutes: 35,
              },
              {
                title: 'Masukkan data/kutipan referensi esensial ke pembahasan',
                isPareto: true,
                minutes: 25,
              },
            ],
          },
          {
            name: '3. Penuntasan Cepat (Aturan 85%)',
            purpose: 'Rapikan format dasar dan kumpulkan tanpa overthinking.',
            stepTemplates: [
              {
                title: 'Cek daftar pustaka, margin, dan kumpulkan draf 85%',
                isPareto: false,
                minutes: 15,
              },
            ],
          },
        ]
      }

      return [
        {
          name: '1. Fondasi & Pengumpulan Bahan',
          purpose: 'Mencari sumber ilmiah dan menyusun peta ide.',
          stepTemplates: [
            {
              title: 'Buka dokumen baru & buat outline subjudul bab',
              isPareto: false,
              minutes: 15,
              starter: 'Buka template format kampus.',
            },
            {
              title: 'Kumpulkan minimal 3–5 jurnal rujukan relevan (baca abstrak)',
              isPareto: true,
              minutes: 30,
            },
          ],
        },
        {
          name: '2. Penulisan Draf Inti (Pareto 80/20)',
          purpose: 'Menulis isi analisis mendalam tanpa terdistraksi revisi kata.',
          stepTemplates: [
            {
              title: 'Tulis draf kasar bab pembahasan dari bahan rujukan utama',
              isPareto: true,
              minutes: 45,
            },
            {
              title: 'Susun kesimpulan dan keterkaitan antar temuan',
              isPareto: true,
              minutes: 25,
            },
          ],
        },
        {
          name: isDeep ? '3. Tinjauan Kritis & Sitasi' : '3. Finishing & Aturan 85%',
          purpose: 'Pengecekan konsistensi sebelum pengumpulan.',
          stepTemplates: isDeep
            ? [
                {
                  title: 'Sinkronkan sitasi dengan Mendeley/Zotero & daftar pustaka',
                  isPareto: false,
                  minutes: 20,
                },
                {
                  title: 'Baca ulang 1 kali untuk kohesi kalimat & kumpulkan draf',
                  isPareto: false,
                  minutes: 20,
                },
              ]
            : [
                {
                  title: 'Cek format margin, nomor halaman, dan selesaikan di 85%',
                  isPareto: false,
                  minutes: 15,
                },
              ],
        },
      ]

    case 'EXAM_STUDY':
      return [
        {
          name: '1. Pemetaan Bahan (Survey & SQ3R)',
          purpose: 'Mengetahui cakupan materi sebelum mulai menghafal.',
          stepTemplates: [
            {
              title: 'Pindai silabus/daftar isi bab materi yang diujikan',
              isPareto: false,
              minutes: 10,
            },
            {
              title: 'Tandai 2 topik yang paling sering keluar atau paling sulit',
              isPareto: true,
              minutes: 15,
            },
          ],
        },
        {
          name: '2. Pemahaman Konsep Inti (Feynman & Active Recall)',
          purpose: 'Menjelaskan konsep dengan bahasa sederhana dan menguji ingatan.',
          stepTemplates: [
            {
              title: 'Uraikan 2 konsep tersulit dengan analogi sederhana (Feynman)',
              isPareto: true,
              minutes: 30,
            },
            {
              title: 'Buat 5–8 flashcard tanya-jawab penting di Ruang Belajar',
              isPareto: true,
              minutes: 25,
            },
          ],
        },
        {
          name: '3. Simulasi & Latihan Mandiri',
          purpose: 'Uji ingatan tanpa melihat buku untuk mengukur kesiapan nyata.',
          stepTemplates: [
            {
              title: 'Kerjakan 3 contoh soal ujian tahun lalu dengan timer',
              isPareto: false,
              minutes: 30,
            },
          ],
        },
      ]

    case 'CODING_TECH':
      return [
        {
          name: '1. Inisialisasi & Logika Dasar',
          purpose: 'Menyiapkan workspace dan diagram alur solusi.',
          stepTemplates: [
            {
              title: 'Buka repo, buat branch baru, dan verifikasi build lokal',
              isPareto: false,
              minutes: 10,
            },
            {
              title: 'Tulis pseudocode atau sketsa alur data fungsi utama',
              isPareto: true,
              minutes: 20,
            },
          ],
        },
        {
          name: '2. Implementasi Fitur Inti (MVP 80/20)',
          purpose: 'Koding logika terpenting sampai berfungsi minimal.',
          stepTemplates: [
            {
              title: 'Implementasi fungsi inti / endpoint yang menjadi tulang punggung',
              isPareto: true,
              minutes: 45,
            },
            {
              title: 'Tulis unit test dasar untuk memastikan kasus sukses',
              isPareto: false,
              minutes: 20,
            },
          ],
        },
        {
          name: '3. Verifikasi & Finishing',
          purpose: 'Pembersihan kode dan pengujian akhir.',
          stepTemplates: [
            {
              title: 'Uji coba manual skenario error & rapikan styling UI',
              isPareto: false,
              minutes: 20,
            },
            {
              title: 'Commit perubahan & jalankan build akhir tanpa error',
              isPareto: false,
              minutes: 10,
            },
          ],
        },
      ]

    case 'PRESENTATION':
      return [
        {
          name: '1. Struktur Cerita & Argumen',
          purpose: 'Menentukan 3 pesan utama agar audiens tidak jenuh.',
          stepTemplates: [
            {
              title: 'Tentukan 3 pesan kunci yang wajib diingat penguji/audiens',
              isPareto: true,
              minutes: 15,
            },
            {
              title: 'Susun outline urutan slide (Maksimal 10–12 slide)',
              isPareto: false,
              minutes: 15,
            },
          ],
        },
        {
          name: '2. Pembuatan Visual Slide Inti',
          purpose: 'Memasukkan data penting tanpa animasi yang membuang waktu.',
          stepTemplates: [
            {
              title: 'Isi slide pembahasan dengan grafik/diagram pendukung utama',
              isPareto: true,
              minutes: 35,
            },
          ],
        },
        {
          name: '3. Latihan Vokal Terukur (10m Sprint)',
          purpose: 'Memastikan durasi bicara pas dan percaya diri.',
          stepTemplates: [
            {
              title: 'Latihan membawakan slide dengan timer 10 menit',
              isPareto: true,
              minutes: 15,
            },
            {
              title: 'Siapkan jawaban untuk 2 potensi pertanyaan penguji',
              isPareto: false,
              minutes: 15,
            },
          ],
        },
      ]

    case 'ADMIN_OPERATIONAL':
      return [
        {
          name: '1. Verifikasi Syarat & Berkas',
          purpose: 'Mencegah bolak-balik karena dokumen tertinggal.',
          stepTemplates: [
            {
              title: 'Cek daftar syarat berkas resmi & siapkan dokumen asli/scan',
              isPareto: true,
              minutes: 15,
            },
          ],
        },
        {
          name: '2. Pengisian & Pengiriman',
          purpose: 'Menuntaskan formulir dalam satu sesi fokus.',
          stepTemplates: [
            {
              title: 'Isi data formulir utama secara teliti',
              isPareto: true,
              minutes: 20,
            },
            {
              title: 'Kirim / serahkan ke bagian terkait & simpan bukti tanda terima',
              isPareto: false,
              minutes: 10,
            },
          ],
        },
      ]

    default: // GENERAL_PROJECT
      return [
        {
          name: '1. Inisiasi 2 Menit (Zeigarnik Starter)',
          purpose: 'Langkah pembuka yang sangat mudah untuk memecah kemalasan.',
          stepTemplates: [
            {
              title: `Tentukan tindakan 2 menit pertama untuk "${title.slice(0, 32)}"`,
              isPareto: false,
              minutes: 10,
              starter: 'Buka catatan dan siapkan alat kerja.',
            },
          ],
        },
        {
          name: '2. Eksekusi Bagian Inti (Pareto 80/20)',
          purpose: 'Mengerjakan bagian yang menghasilkan 80% dampak utama.',
          stepTemplates: [
            {
              title: 'Selesaikan bagian paling krusial yang menentukan keberhasilan tugas',
              isPareto: true,
              minutes: 40,
            },
          ],
        },
        {
          name: '3. Penuntasan (Aturan 85%)',
          purpose: 'Hindari overthinking, akhiri saat sudah cukup baik.',
          stepTemplates: [
            {
              title: 'Tinjau hasil sepintas dan tuntaskan di 85%',
              isPareto: false,
              minutes: 15,
            },
          ],
        },
      ]
  }
}

function pickRecommendedTechniques(
  domain: TaskDomain,
  timePressure: TimePressureLevel,
  scale: TaskScale,
  preset: DecompositionPreset
): Array<{ name: string; why: string }> {
  const list: Array<{ name: string; why: string }> = []

  if (timePressure === 'URGENT' || preset === 'URGENT_SPRINT') {
    list.push({
      name: 'The 85% Rule (Lawan Perfeksionisme)',
      why: 'Karena sisa waktu terbatas, jangan terjebak memoles detail kecil. Kumpulkan saat sudah 85% tuntas.',
    })
    list.push({
      name: 'The 10-Minute Rule',
      why: 'Saat panik deadline, komitmenkan 10 menit fokus penuh terlebih dahulu untuk menghilangkan hambatan mulai.',
    })
  } else {
    list.push({
      name: 'Pomodoro 25/5 atau Flow 45m',
      why: 'Gunakan blok waktu fokus berirama agar stamina otak tetap terjaga tanpa burnout.',
    })
  }

  if (domain === 'EXAM_STUDY') {
    list.push({
      name: 'Metode Feynman & Active Recall',
      why: 'Uji ingatan mandiri dengan bahasa sederhana terbukti 3x lebih awet dibanding membaca ulang pasif.',
    })
  } else if (domain === 'WRITING_ACADEMIC') {
    list.push({
      name: 'Prinsip Pareto (80/20)',
      why: '80% isi draf berasal dari 20% argumen inti. Tulis draf kasar terlebih dahulu sebelum memformat sitasi.',
    })
  } else if (scale === 'Besar' || scale === 'Tugas Akhir') {
    list.push({
      name: 'WOOP & Premortem Analysis',
      why: 'Antisipasi hambatan terbesar (seperti rasa jenuh atau distraksi medsos) dengan rencana Jika–Maka.',
    })
  }

  return list
}
