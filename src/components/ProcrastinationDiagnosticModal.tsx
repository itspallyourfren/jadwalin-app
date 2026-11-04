// src/components/ProcrastinationDiagnosticModal.tsx - Comprehensive Academic Diagnostic: Personal Baseline + MAPS-15 + App Expectations
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

  // Step 2: MAPS-15 (15 randomized items in 3 batches)
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

  // Calculated MAPS-15 & Profile Synthesis
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

  // Batch slicing for MAPS-15 (5 items per batch)
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
          title: 'Asesmen Psikometri MAPS-15',
          subtitle: 'Tahap 2 dari 4: Butir 1–5 dari 15 (±30 detik)',
        }
      case 'MAPS_2':
        return {
          title: 'Asesmen Psikometri MAPS-15',
          subtitle: 'Tahap 2 dari 4: Butir 6–10 dari 15',
        }
      case 'MAPS_3':
        return {
          title: 'Asesmen Psikometri MAPS-15',
          subtitle: 'Tahap 2 dari 4: Butir 11–15 dari 15',
        }
      case 'EXPECTATION':
        return {
          title: 'Harapan terhadap Aplikasi',
          subtitle: 'Tahap 3 dari 4: Fitur prioritas yang kamu butuhkan',
        }
      case 'REPORT':
        return {
          title: 'Rapor Profil Belajar & Rekomendasi',
          subtitle: `Disusun berdasarkan MAPS-15 untuk ${displayName}`,
        }
    }
  }

  const headerMeta = renderHeaderMeta()

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-xl rounded-2xl sm:rounded-3xl border border-[#C9B99F] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C4A3E] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1E1915]">
                {headerMeta.title}
              </h2>
              <p className="text-xs text-[#5C5148] font-medium">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup tes diagnosis"
            className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
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
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-2">
                <label className="text-xs font-black text-[#1E1915] block">
                  1. Nama Panggilanmu
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ketik nama panggilanmu (misal: Rian / Sarah)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#C9B99F] text-xs font-bold text-[#1E1915] focus:outline-2 focus:outline-[#2C4A3E]"
                />
              </div>

              {/* Academic Burden / Situation */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#1E1915] block">
                  2. Apa target atau situasi akademik utamamu saat ini?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACADEMIC_GOALS.map((g) => {
                    const isSelected = personalGoal === g.id
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setPersonalGoal(g.id)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-2xs'
                            : 'bg-[#FFFDF9] hover:bg-[#F2ECE1] text-[#1E1915] border-[#E2D9C8]'
                        }`}
                      >
                        <span className="text-xl shrink-0">{g.icon}</span>
                        <div>
                          <span className="text-xs font-black block leading-snug">
                            {g.title}
                          </span>
                          <span
                            className={`text-[11px] block mt-0.5 leading-relaxed ${
                              isSelected ? 'text-white/80' : 'text-[#5C5148]'
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
                <label className="text-xs font-black text-[#1E1915] block">
                  3. Apa yang paling sering kamu rasakan saat mulai menunda tugas?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PERSONAL_OBSTACLES.map((o) => {
                    const isSelected = personalObstacle === o.id
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setPersonalObstacle(o.id)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-2xs'
                            : 'bg-[#FFFDF9] hover:bg-[#F2ECE1] text-[#1E1915] border-[#E2D9C8]'
                        }`}
                      >
                        <span className="text-xl shrink-0">{o.icon}</span>
                        <div>
                          <span className="text-xs font-black block leading-snug">
                            {o.title}
                          </span>
                          <span
                            className={`text-[11px] block mt-0.5 leading-relaxed ${
                              isSelected ? 'text-white/80' : 'text-[#5C5148]'
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

          {/* STEP 2: MAPS-15 BATCHES (1, 2, 3) */}
          {(step === 'MAPS_1' || step === 'MAPS_2' || step === 'MAPS_3') && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3 text-xs text-[#5C5148] flex items-center justify-between">
                <span>
                  Skala: <strong>1</strong> (Sangat Tidak Sesuai) s.d. <strong>5</strong> (Sangat Sesuai)
                </span>
                <span className="font-extrabold text-[#2C4A3E]">
                  {step === 'MAPS_1' ? 'Batch 1/3' : step === 'MAPS_2' ? 'Batch 2/3' : 'Batch 3/3'}
                </span>
              </div>

              <div className="space-y-3">
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
                      className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#F2ECE1] text-[#1E1915] text-[11px] font-black flex items-center justify-center shrink-0">
                            {globalIdx}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#8C7E72] border border-[#E2D9C8]">
                            {item.dimensionLabel}
                          </span>
                        </div>
                        {currentAnswer && (
                          <span className="text-[11px] font-extrabold text-[#2C4A3E] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Terisi
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-[#1E1915] leading-relaxed">
                        &ldquo;{item.text}&rdquo;
                      </p>

                      {/* 5-Point Likert Rating Buttons */}
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {[
                          { val: 1, label: 'STS', full: 'Sangat Tidak Sesuai' },
                          { val: 2, label: 'TS', full: 'Tidak Sesuai' },
                          { val: 3, label: 'N', full: 'Netral / Ragu' },
                          { val: 4, label: 'S', full: 'Sesuai' },
                          { val: 5, label: 'SS', full: 'Sangat Sesuai' },
                        ].map((opt) => {
                          const isSelected = currentAnswer === opt.val
                          return (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() =>
                                setMapsResponses((prev) => ({ ...prev, [item.id]: opt.val }))
                              }
                              title={opt.full}
                              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#2C4A3E] text-white shadow-2xs font-extrabold ring-2 ring-[#2C4A3E]/30'
                                  : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#5C5148] border border-[#E2D9C8] font-bold'
                              }`}
                            >
                              <span className="text-xs leading-none">{opt.val}</span>
                              <span className="text-[10px] opacity-80 mt-0.5 leading-none">
                                {opt.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3: APP EXPECTATIONS (What do you need from the app?) */}
          {step === 'EXPECTATION' && (
            <div className="space-y-3">
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5">
                <p className="text-xs text-[#5C5148] leading-relaxed">
                  Pilihlah bantuan utama yang paling kamu butuhkan. Aplikasi akan memprioritaskan papan kerja dan alat produktivitas yang sesuai untukmu.
                </p>
              </div>

              <div className="space-y-2">
                {APP_EXPECTATIONS.map((exp) => {
                  const isSelected = appExpectation === exp.id
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setAppExpectation(exp.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-2xs'
                          : 'bg-[#FFFDF9] hover:bg-[#F2ECE1] text-[#1E1915] border-[#E2D9C8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black block leading-snug">
                          {exp.title}
                        </span>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </div>
                      <p
                        className={`text-[11px] mt-1 leading-relaxed ${
                          isSelected ? 'text-white/80' : 'text-[#5C5148]'
                        }`}
                      >
                        {exp.desc}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${
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
              {/* Total MAPS-15 Score Header */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 text-center space-y-2 shadow-2xs">
                <span className="text-xs font-extrabold text-[#8C7E72] uppercase tracking-wider block">
                  Indeks Kerentanan Prokrastinasi Akademik
                </span>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl font-black text-[#1E1915] tracking-tight">
                    {mapsAssessment.totalScore}
                  </span>
                  <span className="text-sm font-extrabold text-[#8C7E72]">/ 75</span>
                </div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
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
                <p className="text-xs text-[#5C5148] max-w-sm mx-auto leading-relaxed pt-1">
                  Data ini tersimpan offline sebagai baseline pribadi untuk mengukur perubahanmu di kemudian hari.
                </p>
              </div>

              {/* 3 Dimensional Progress Bars */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <h3 className="text-xs font-black text-[#1E1915] uppercase tracking-wider">
                  Profil 3 Dimensi MAPS-15
                </h3>

                <div className="space-y-2.5">
                  {/* Dimension 1: CP */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1E1915]">
                        1. Inisiasi &amp; Sikap Belajar (CP)
                      </span>
                      <span className="font-extrabold text-[#5C5148]">
                        {mapsAssessment.cpNormalized}% ({mapsAssessment.dimensionLabels.cp})
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#F2ECE1] overflow-hidden">
                      <div
                        className="h-full bg-[#D4532F] rounded-full transition-all duration-300"
                        style={{ width: `${mapsAssessment.cpNormalized}%` }}
                      />
                    </div>
                  </div>

                  {/* Dimension 2: PTM */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1E1915]">
                        2. Manajemen Waktu &amp; Rutinitas (PTM)
                      </span>
                      <span className="font-extrabold text-[#5C5148]">
                        {mapsAssessment.ptmNormalized}% ({mapsAssessment.dimensionLabels.ptm})
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#F2ECE1] overflow-hidden">
                      <div
                        className="h-full bg-[#B86B14] rounded-full transition-all duration-300"
                        style={{ width: `${mapsAssessment.ptmNormalized}%` }}
                      />
                    </div>
                  </div>

                  {/* Dimension 3: WD */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1E1915]">
                        3. Distraksi &amp; Diskoneksi Tugas (WD)
                      </span>
                      <span className="font-extrabold text-[#5C5148]">
                        {mapsAssessment.wdNormalized}% ({mapsAssessment.dimensionLabels.wd})
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#F2ECE1] overflow-hidden">
                      <div
                        className="h-full bg-[#2C4A3E] rounded-full transition-all duration-300"
                        style={{ width: `${mapsAssessment.wdNormalized}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Adaptive Feature Recommendations */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-2.5">
                <h3 className="text-xs font-black text-[#1E1915] uppercase tracking-wider">
                  Rekomendasi Setelan Aplikasi untukmu
                </h3>
                <div className="space-y-1.5 text-xs text-[#1E1915]">
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-between">
                    <span className="font-bold">Tampilan Papan Paling Cocok:</span>
                    <span className="font-extrabold text-[#2C4A3E]">
                      {synthesizedProfile.recommendedFramework === 'KANBAN'
                        ? 'Papan Kanban (Hari Ini & Laci)'
                        : synthesizedProfile.recommendedFramework === 'IVY_LEE'
                        ? 'Antrean Ivy Lee (6 Prioritas)'
                        : synthesizedProfile.recommendedFramework === 'ONE_THREE_FIVE'
                        ? 'Target 1-3-5'
                        : 'Matriks Eisenhower'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-between">
                    <span className="font-bold">Mode Timer yang Disarankan:</span>
                    <span className="font-extrabold text-[#D4532F]">
                      {synthesizedProfile.focusStyle === 'POMODORO'
                        ? 'Pomodoro Multi-Fase (Fokus & Rehat)'
                        : synthesizedProfile.focusStyle === 'TEN_MIN'
                        ? 'Pancingan 10 Menit'
                        : 'Sesi Fleksibel'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1E1915]">
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
        <div className="px-5 py-3.5 bg-[#FFFDF9] border-t border-[#E2D9C8] flex items-center justify-between gap-2 shrink-0">
          {step === 'PERSONAL' && (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep('MAPS_1')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut ke Asesmen MAPS-15</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'MAPS_1' && (
            <>
              <button
                type="button"
                onClick={() => setStep('PERSONAL')}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={!isBatchAnswered(batch1Items)}
                onClick={() => setStep('MAPS_2')}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut (Butir 6–10)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'MAPS_2' && (
            <>
              <button
                type="button"
                onClick={() => setStep('MAPS_1')}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={!isBatchAnswered(batch2Items)}
                onClick={() => setStep('MAPS_3')}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut (Butir 11–15)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'MAPS_3' && (
            <>
              <button
                type="button"
                onClick={() => setStep('MAPS_2')}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={!isBatchAnswered(batch3Items)}
                onClick={() => setStep('EXPECTATION')}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut ke Harapan Aplikasi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'EXPECTATION' && (
            <>
              <button
                type="button"
                onClick={() => setStep('MAPS_3')}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('REPORT')}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
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
                className="px-3.5 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Ubah Jawaban</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#C9B99F] text-[#1E1915] text-xs font-bold cursor-pointer transition-colors"
                >
                  Terapkan Langsung
                </button>
                <button
                  type="button"
                  onClick={() => handleFinish(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#233B32] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
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
