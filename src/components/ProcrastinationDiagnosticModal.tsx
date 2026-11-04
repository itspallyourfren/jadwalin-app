// src/components/ProcrastinationDiagnosticModal.tsx - Comprehensive Academic Diagnostic: Personal Baseline + Questionnaire + App Expectations
import React, { useMemo, useState } from 'react'
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  evaluateMaps15Responses,
  shuffleMaps15Items,
  synthesizeProcrastinationProfile,
  type Maps15Item,
} from '../engine/maps15DiagnosticEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import type {
  AppExpectationGoal,
  PrimaryAcademicGoal,
  ProcrastinationArchetype,
  UserProcrastinationProfile,
} from '../data/types'

type StepId = 'PERSONAL' | 'MAPS_1' | 'MAPS_2' | 'MAPS_3' | 'EXPECTATION' | 'REPORT'

type ProcrastinationDiagnosticModalProps = {
  onClose: () => void
  onStartTourAfterDiagnosis?: () => void
}

const ACADEMIC_GOALS: Array<{
  id: PrimaryAcademicGoal
  title: string
  desc: string
  icon: string
}> = [
  {
    id: 'THESIS',
    title: 'Skripsi / Tugas Akhir',
    desc: 'Menyusun proposal, bab pembahasan, riset literatur, atau olah data naskah akhir.',
    icon: '🎓',
  },
  {
    id: 'COURSEWORK',
    title: 'Tugas Kuliah & Makalah Rutin',
    desc: 'Menyelesaikan laporan mingguan, tugas kelompok, presentasi, dan esai kuliah.',
    icon: '📚',
  },
  {
    id: 'EXAMS',
    title: 'Persiapan Ujian & Materi Kuliah',
    desc: 'Belajar untuk UTS/UAS, kuis, menghafal konsep, dan membaca bahan kuliah tebal.',
    icon: '📝',
  },
  {
    id: 'ROUTINE',
    title: 'Disiplin Belajar Mandiri',
    desc: 'Membangun kebiasaan harian yang konsisten dan mengatasi rasa malas mencicil.',
    icon: '🎯',
  },
]

const PERSONAL_OBSTACLES: Array<{
  id: ProcrastinationArchetype
  title: string
  desc: string
  icon: string
}> = [
  {
    id: 'OVERWHELMED',
    title: 'Kewalahan & Bingung Mulai',
    desc: 'Beban tugas terasa terlalu besar dan rumit, membuat kepala pusing sebelum mulai.',
    icon: '🌊',
  },
  {
    id: 'PERFECTIONIST',
    title: 'Takut Salah (Perfeksionis)',
    desc: 'Ragu memulai sebelum semua referensi siap atau takut hasil naskah kurang sempurna.',
    icon: '🎯',
  },
  {
    id: 'DEADLINER',
    title: 'Baru Gerak Saat Mepet (SKS)',
    desc: 'Sulit mendapatkan energi kalau belum H-1 atau beberapa jam sebelum deadline.',
    icon: '⚡',
  },
  {
    id: 'DISTRACTED',
    title: 'Cepat Bosan & Gatal Buka HP',
    desc: 'Baru mengetik sebentar langsung membuka media sosial atau perhatian terpecah.',
    icon: '📱',
  },
]

const APP_EXPECTATIONS: Array<{
  id: AppExpectationGoal
  title: string
  desc: string
  featureBadge: string
}> = [
  {
    id: 'BREAK_BIG_TASKS',
    title: 'Pecah tugas besar jadi langkah kecil',
    desc: 'Bantu saya agar tidak bingung mulai dan langsung tahu aksi pembuka < 2 menit.',
    featureBadge: 'Dekomposisi Otomatis + Task Chunking',
  },
  {
    id: 'BEAT_DISTRACTIONS',
    title: 'Kunci fokus & stop buka HP saat belajar',
    desc: 'Bantu saya menahan godaan medsos dan menjalani siklus fokus-rehat yang disiplin.',
    featureBadge: 'Pomodoro Multi-Fase + Ulysses Pact',
  },
  {
    id: 'BUILD_ROUTINE',
    title: 'Rapikan rutinitas harian teratur',
    desc: 'Bantu saya menyusun antrean prioritas harian agar tugas tidak menumpuk di akhir.',
    featureBadge: 'Papan Ivy Lee + Target 1-3-5',
  },
  {
    id: 'REDUCE_ANXIETY_DEADLINE',
    title: 'Kurangi cemas & berani kumpul tugas',
    desc: 'Bantu saya mengatasi overthinking naskah dan berani submit dengan prinsip 85%.',
    featureBadge: 'Aturan 85% + Matriks Eisenhower',
  },
]

const LIKERT_OPTIONS = [
  { val: 1, label: 'STS', full: '1 — Sangat Tidak Sesuai (Hampir Tidak Pernah)' },
  { val: 2, label: 'TS', full: '2 — Tidak Sesuai (Jarang Sekali)' },
  { val: 3, label: 'Netral', full: '3 — Netral (Kadang-Kadang)' },
  { val: 4, label: 'Sesuai', full: '4 — Sesuai (Sering Terjadi)' },
  { val: 5, label: 'SS', full: '5 — Sangat Sesuai (Sangat Sering)' },
] as const

export const ProcrastinationDiagnosticModal: React.FC<ProcrastinationDiagnosticModalProps> = ({
  onClose,
  onStartTourAfterDiagnosis,
}) => {
  const saveDiagnosisResult = useTrackerStore((s) => s.saveDiagnosisResult)
  const existingProfile = useTrackerStore((s) => s.userProfile)
  const participantName = useTrackerStore((s) => s.participantName)
  const characterId = useTrackerStore((s) => s.characterId)
  const setParticipantProfile = useTrackerStore((s) => s.setParticipantProfile)

  // Step flow state
  const [step, setStep] = useState<StepId>('PERSONAL')

  // Step 1: Personal Conditions
  const [userName, setUserName] = useState<string>(participantName || '')
  const [personalGoal, setPersonalGoal] = useState<PrimaryAcademicGoal>(
    existingProfile?.primaryGoal ?? 'THESIS'
  )
  const [personalObstacle, setPersonalObstacle] = useState<ProcrastinationArchetype>(
    existingProfile?.archetype ?? 'OVERWHELMED'
  )

  // Step 2: 15 randomized items in 3 batches
  const shuffledMapsItems = useMemo<Maps15Item[]>(() => shuffleMaps15Items(), [])
  const [mapsResponses, setMapsResponses] = useState<Record<number, number>>(() => {
    return existingProfile?.maps15?.rawResponses ?? {}
  })

  // Step 3: App Expectations
  const [appExpectation, setAppExpectation] = useState<AppExpectationGoal>(
    existingProfile?.appExpectation ?? 'BREAK_BIG_TASKS'
  )

  // Step 4: Starter task toggle
  const [createStarterTask, setCreateStarterTask] = useState(true)

  // Calculated Profile Synthesis
  const mapsAssessment = useMemo(() => {
    return evaluateMaps15Responses(mapsResponses)
  }, [mapsResponses])

  const synthesizedProfile = useMemo<UserProcrastinationProfile>(() => {
    return synthesizeProcrastinationProfile({
      userName: userName.trim() || 'Teman Belajar',
      personalGoal,
      personalObstacle,
      appExpectation,
      maps15Assessment: mapsAssessment,
    })
  }, [userName, personalGoal, personalObstacle, appExpectation, mapsAssessment])

  const displayName = userName.trim() || 'Teman Belajar'

  // Batch slicing (5 items per batch)
  const batch1Items = shuffledMapsItems.slice(0, 5)
  const batch2Items = shuffledMapsItems.slice(5, 10)
  const batch3Items = shuffledMapsItems.slice(10, 15)

  const isBatchAnswered = (items: Maps15Item[]) => {
    return items.every((i) => typeof mapsResponses[i.id] === 'number')
  }

  const handleFinish = (startTour: boolean) => {
    if (userName.trim()) {
      setParticipantProfile(userName.trim(), characterId)
    }
    saveDiagnosisResult(synthesizedProfile, createStarterTask)
    onClose()
    if (startTour && onStartTourAfterDiagnosis) {
      setTimeout(() => {
        onStartTourAfterDiagnosis()
      }, 300)
    }
  }

  // Header Title & Subtitle helper
  const renderHeaderMeta = () => {
    switch (step) {
      case 'PERSONAL':
        return {
          title: 'Kondisi & Perasaan Pribadi',
          subtitle: 'Tahap 1 dari 4: Ceritakan situasi akademikmu',
        }
      case 'MAPS_1':
        return {
          title: 'Refleksi Pola Belajar',
          subtitle: 'Tahap 2 dari 4: Pertanyaan 1–5 dari 15',
        }
      case 'MAPS_2':
        return {
          title: 'Refleksi Pola Belajar',
          subtitle: 'Tahap 2 dari 4: Pertanyaan 6–10 dari 15',
        }
      case 'MAPS_3':
        return {
          title: 'Refleksi Pola Belajar',
          subtitle: 'Tahap 2 dari 4: Pertanyaan 11–15 dari 15',
        }
      case 'EXPECTATION':
        return {
          title: 'Harapan terhadap Aplikasi',
          subtitle: 'Tahap 3 dari 4: Fitur prioritas yang kamu butuhkan',
        }
      case 'REPORT':
        return {
          title: 'Rapor Pola Belajar & Rekomendasi',
          subtitle: `Disusun berdasarkan kebiasaan belajarmu, ${displayName}`,
        }
    }
  }

  const headerMeta = renderHeaderMeta()

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-xl rounded-2xl sm:rounded-3xl border-2 border-[#D4C3A3] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#FFFDF9] border-b-2 border-[#E2D9C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2C4A3E] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1E1915] leading-tight">
                {headerMeta.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5148] font-bold">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup tes diagnosis"
            className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] transition-colors cursor-pointer"
          >
            <span className="text-base font-black">✕</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* STEP 1: PERSONAL CONDITION & USERNAME */}
          {step === 'PERSONAL' && (
            <div className="space-y-4">
              {/* Name Input */}
              <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4C3A3] p-4 space-y-2 shadow-xs">
                <label className="text-sm font-black text-[#1E1915] block">
                  1. Nama Panggilanmu
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ketik nama panggilanmu (misal: Rian / Sarah)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border-2 border-[#C9B99F] text-sm font-extrabold text-[#1E1915] focus:outline-2 focus:outline-[#2C4A3E]"
                />
              </div>

              {/* Academic Burden / Situation */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#1E1915] block">
                  2. Apa target atau situasi akademik utamamu saat ini?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACADEMIC_GOALS.map((g) => {
                    const isSelected = personalGoal === g.id
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setPersonalGoal(g.id)}
                        className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-sm'
                            : 'bg-[#FFFDF9] hover:bg-[#F2ECE1] text-[#1E1915] border-[#D4C3A3]'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{g.icon}</span>
                        <div>
                          <span className="text-sm font-black block leading-snug">
                            {g.title}
                          </span>
                          <span
                            className={`text-xs block mt-1 leading-relaxed ${
                              isSelected ? 'text-white/90 font-medium' : 'text-[#5C5148] font-semibold'
                            }`}
                          >
                            {g.desc}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Personal Emotional Obstacle */}
              <div className="space-y-2">
                <label className="text-sm font-black text-[#1E1915] block">
                  3. Apa yang paling sering kamu rasakan saat mulai menunda tugas?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERSONAL_OBSTACLES.map((o) => {
                    const isSelected = personalObstacle === o.id
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setPersonalObstacle(o.id)}
                        className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-sm'
                            : 'bg-[#FFFDF9] hover:bg-[#F2ECE1] text-[#1E1915] border-[#D4C3A3]'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{o.icon}</span>
                        <div>
                          <span className="text-sm font-black block leading-snug">
                            {o.title}
                          </span>
                          <span
                            className={`text-xs block mt-1 leading-relaxed ${
                              isSelected ? 'text-white/90 font-medium' : 'text-[#5C5148] font-semibold'
                            }`}
                          >
                            {o.desc}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: QUESTIONNAIRE BATCHES (1, 2, 3) */}
          {(step === 'MAPS_1' || step === 'MAPS_2' || step === 'MAPS_3') && (
            <div className="space-y-4">
              {/* Scale Instruction Banner */}
              <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4C3A3] p-3.5 text-xs sm:text-sm font-extrabold text-[#1E1915] flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2C4A3E] inline-block" />
                  <span>
                    Skala: <strong>1</strong> (Sangat Jarang) s.d. <strong>5</strong> (Sangat Sering)
                  </span>
                </div>
                <span className="font-black text-[#2C4A3E] bg-[#2C4A3E]/10 px-3 py-1 rounded-xl">
                  {step === 'MAPS_1' ? 'Bagian 1/3' : step === 'MAPS_2' ? 'Bagian 2/3' : 'Bagian 3/3'}
                </span>
              </div>

              {/* Question Cards */}
              <div className="space-y-3.5">
                {(step === 'MAPS_1'
                  ? batch1Items
                  : step === 'MAPS_2'
                  ? batch2Items
                  : batch3Items
                ).map((item, idx) => {
                  const globalIdx =
                    (step === 'MAPS_1' ? 0 : step === 'MAPS_2' ? 5 : 10) + idx + 1
                  const currentAnswer = mapsResponses[item.id]

                  return (
                    <div
                      key={item.id}
                      className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4C3A3] p-4 sm:p-5 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#2C4A3E] text-white text-xs font-black flex items-center justify-center shrink-0">
                            {globalIdx}
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] text-[#2C4A3E] border border-[#C9B99F]">
                            {item.dimensionLabel}
                          </span>
                        </div>
                        {currentAnswer ? (
                          <span className="text-xs font-black text-[#2C4A3E] bg-[#E7F6EE] px-2.5 py-1 rounded-lg border border-[#2C4A3E]/20 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Terisi
                          </span>
                        ) : (
                          <span className="text-xs font-extrabold text-[#C8432B]">
                            Belum dijawab
                          </span>
                        )}
                      </div>

                      {/* Question Text with High Contrast & Larger Font */}
                      <p className="text-sm sm:text-base font-extrabold text-[#1E1915] leading-relaxed">
                        &ldquo;{item.text}&rdquo;
                      </p>

                      {/* 5-Point Likert Rating Buttons (Large, Solid, High-Contrast) */}
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                          {LIKERT_OPTIONS.map((opt) => {
                            const isSelected = currentAnswer === opt.val
                            return (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() =>
                                  setMapsResponses((prev) => ({ ...prev, [item.id]: opt.val }))
                                }
                                title={opt.full}
                                className={`min-h-[56px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#2C4A3E] text-white shadow-sm font-black border-2 border-[#2C4A3E] scale-[1.02] ring-2 ring-[#2C4A3E]/30'
                                    : 'bg-[#FFFDF9] hover:bg-[#F2ECE1] text-[#1E1915] border-2 border-[#D4C3A3] hover:border-[#2C4A3E]/60 font-black'
                                }`}
                              >
                                <span className="text-base sm:text-lg font-black leading-none">
                                  {opt.val}
                                </span>
                                <span className="text-[11px] font-bold mt-1 leading-none truncate max-w-full">
                                  {opt.label}
                                </span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Active Selection Feedback Banner */}
                        {currentAnswer && (
                          <div className="text-xs font-extrabold text-[#2C4A3E] bg-[#E7F6EE] p-2.5 rounded-xl border border-[#2C4A3E]/20 flex items-center justify-between">
                            <span className="text-[#5C5148]">Jawabanmu:</span>
                            <span className="font-black">
                              {LIKERT_OPTIONS.find((o) => o.val === currentAnswer)?.full}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3: APP EXPECTATIONS (What do you need from the app?) */}
          {step === 'EXPECTATION' && (
            <div className="space-y-3.5">
              <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4C3A3] p-4">
                <p className="text-xs sm:text-sm font-bold text-[#5C5148] leading-relaxed">
                  Pilihlah bantuan utama yang paling kamu butuhkan. Aplikasi akan memprioritaskan papan kerja dan alat produktivitas yang sesuai untukmu.
                </p>
              </div>

              <div className="space-y-2.5">
                {APP_EXPECTATIONS.map((exp) => {
                  const isSelected = appExpectation === exp.id
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setAppExpectation(exp.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-sm'
                          : 'bg-[#FFFDF9] hover:bg-[#F2ECE1] text-[#1E1915] border-[#D4C3A3]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black block leading-snug">
                          {exp.title}
                        </span>
                        {isSelected && <Check className="w-5 h-5 shrink-0" strokeWidth={3} />}
                      </div>
                      <p
                        className={`text-xs mt-1.5 leading-relaxed ${
                          isSelected ? 'text-white/90 font-medium' : 'text-[#5C5148] font-bold'
                        }`}
                      >
                        {exp.desc}
                      </p>
                      <div className="mt-2.5">
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-lg inline-block ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#FAF7F2] text-[#2C4A3E] border border-[#C9B99F]'
                          }`}
                        >
                          Fokus Fitur: {exp.featureBadge}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 4: PSYCHOLOGICAL REPORT & ACTION */}
          {step === 'REPORT' && (
            <div className="space-y-4">
              {/* Total Procrastination Score Header */}
              <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4C3A3] p-5 text-center space-y-2 shadow-xs">
                <span className="text-xs font-black text-[#8C7E72] uppercase tracking-wider block">
                  Skor Kecenderungan Menunda Tugas
                </span>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-black text-[#1E1915] tracking-tight">
                    {mapsAssessment.totalScore}
                  </span>
                  <span className="text-base font-black text-[#8C7E72]">/ 75</span>
                </div>
                <div>
                  <span
                    className={`inline-block px-3.5 py-1 rounded-full text-xs font-black ${
                      mapsAssessment.normalizedScore > 65
                        ? 'bg-[#FDECE8] text-[#C8432B]'
                        : mapsAssessment.normalizedScore >= 40
                        ? 'bg-[#FEF3E2] text-[#B86B14]'
                        : 'bg-[#E7F6EE] text-[#1F7A4C]'
                    }`}
                  >
                    Tingkat Prokrastinasi:{' '}
                    {mapsAssessment.normalizedScore > 65
                      ? 'Rentan Tinggi'
                      : mapsAssessment.normalizedScore >= 40
                      ? 'Tingkat Sedang'
                      : 'Terkendali & Kuat'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#5C5148] max-w-sm mx-auto leading-relaxed pt-1">
                  Data ini tersimpan offline sebagai baseline pribadi untuk mengukur perubahanmu di kemudian hari.
                </p>
              </div>

              {/* 3 Dimensional Progress Bars */}
              <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4C3A3] p-4 sm:p-5 space-y-3.5 shadow-xs">
                <h3 className="text-xs sm:text-sm font-black text-[#1E1915] uppercase tracking-wider">
                  Peta 3 Pola Belajarmu
                </h3>

                <div className="space-y-3">
                  {/* Dimension 1: CP */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-extrabold text-[#1E1915]">
                        1. Tantangan Memulai Tugas (Inisiasi)
                      </span>
                      <span className="font-black text-[#D4532F]">
                        {mapsAssessment.cpNormalized}% ({mapsAssessment.dimensionLabels.cp})
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#EADBCE] overflow-hidden">
                      <div
                        className="h-full bg-[#D4532F] rounded-full transition-all duration-300"
                        style={{ width: `${mapsAssessment.cpNormalized}%` }}
                      />
                    </div>
                  </div>

                  {/* Dimension 2: PTM */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-extrabold text-[#1E1915]">
                        2. Pengaturan Waktu &amp; Rutinitas
                      </span>
                      <span className="font-black text-[#B86B14]">
                        {mapsAssessment.ptmNormalized}% ({mapsAssessment.dimensionLabels.ptm})
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#EADBCE] overflow-hidden">
                      <div
                        className="h-full bg-[#B86B14] rounded-full transition-all duration-300"
                        style={{ width: `${mapsAssessment.ptmNormalized}%` }}
                      />
                    </div>
                  </div>

                  {/* Dimension 3: WD */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-extrabold text-[#1E1915]">
                        3. Daya Tahan Fokus dari Gangguan
                      </span>
                      <span className="font-black text-[#2C4A3E]">
                        {mapsAssessment.wdNormalized}% ({mapsAssessment.dimensionLabels.wd})
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#EADBCE] overflow-hidden">
                      <div
                        className="h-full bg-[#2C4A3E] rounded-full transition-all duration-300"
                        style={{ width: `${mapsAssessment.wdNormalized}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Adaptive Feature Recommendations */}
              <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#D4C3A3] p-4 sm:p-5 space-y-3 shadow-xs">
                <h3 className="text-xs sm:text-sm font-black text-[#1E1915] uppercase tracking-wider">
                  Rekomendasi Setelan Aplikasi untukmu
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-[#1E1915]">
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#D4C3A3] flex items-center justify-between">
                    <span className="font-bold text-[#5C5148]">Tampilan Papan Paling Cocok:</span>
                    <span className="font-black text-[#2C4A3E]">
                      {synthesizedProfile.recommendedFramework === 'KANBAN'
                        ? 'Papan Kanban (Hari Ini & Laci)'
                        : synthesizedProfile.recommendedFramework === 'IVY_LEE'
                        ? 'Antrean Ivy Lee (6 Prioritas)'
                        : synthesizedProfile.recommendedFramework === 'ONE_THREE_FIVE'
                        ? 'Target 1-3-5'
                        : 'Matriks Eisenhower'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#D4C3A3] flex items-center justify-between">
                    <span className="font-bold text-[#5C5148]">Mode Timer yang Disarankan:</span>
                    <span className="font-black text-[#D4532F]">
                      {synthesizedProfile.focusStyle === 'POMODORO'
                        ? 'Pomodoro Multi-Fase (Fokus & Rehat)'
                        : synthesizedProfile.focusStyle === 'TEN_MIN'
                        ? 'Pancingan 10 Menit'
                        : 'Sesi Fleksibel'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-[#1E1915]">
                    <input
                      type="checkbox"
                      checked={createStarterTask}
                      onChange={(e) => setCreateStarterTask(e.target.checked)}
                      className="w-4 h-4 accent-[#2C4A3E]"
                    />
                    <span>Tambahkan 1 target tugas starter perdana di papan belajarmu</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Controls */}
        <div className="px-5 py-3.5 bg-[#FFFDF9] border-t-2 border-[#E2D9C8] flex items-center justify-between gap-2 shrink-0">
          {step === 'PERSONAL' && (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep('MAPS_1')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut ke Cek Pola Belajar</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          {step === 'MAPS_1' && (
            <>
              <button
                type="button"
                onClick={() => setStep('PERSONAL')}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs sm:text-sm font-black flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={!isBatchAnswered(batch1Items)}
                onClick={() => setStep('MAPS_2')}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut (Pertanyaan 6–10)</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}

          {step === 'MAPS_2' && (
            <>
              <button
                type="button"
                onClick={() => setStep('MAPS_1')}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs sm:text-sm font-black flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={!isBatchAnswered(batch2Items)}
                onClick={() => setStep('MAPS_3')}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut (Pertanyaan 11–15)</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}

          {step === 'MAPS_3' && (
            <>
              <button
                type="button"
                onClick={() => setStep('MAPS_2')}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs sm:text-sm font-black flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={!isBatchAnswered(batch3Items)}
                onClick={() => setStep('EXPECTATION')}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut ke Harapan Fitur</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}

          {step === 'EXPECTATION' && (
            <>
              <button
                type="button"
                onClick={() => setStep('MAPS_3')}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs sm:text-sm font-black flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('REPORT')}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lihat Hasil Rapor</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'REPORT' && (
            <div className="w-full flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setStep('EXPECTATION')}
                className="px-3.5 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs sm:text-sm font-black flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Ubah Jawaban</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border-2 border-[#C9B99F] text-[#1E1915] text-xs sm:text-sm font-black cursor-pointer transition-colors"
                >
                  Terapkan Langsung
                </button>
                <button
                  type="button"
                  onClick={() => handleFinish(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span>Terapkan &amp; Mulai Tur Panduan 🚀</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
