// src/components/ProcrastinationDiagnosticModal.tsx - Academic Procrastination Diagnostic & Onboarding Wizard
import React, { useState } from 'react'
import {
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Layers,
  Sparkles,
  Target,
  User,
  X,
  Zap,
} from 'lucide-react'
import {
  evaluateProcrastinationProfile,
  getArchetypeMetadata,
} from '../engine/procrastinationDiagnosticEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import type {
  PreferredFocusStyle,
  PrimaryAcademicGoal,
  ProcrastinationArchetype,
} from '../data/types'

type ProcrastinationDiagnosticModalProps = {
  onClose: () => void
  onStartTourAfterDiagnosis?: () => void
}

export const ProcrastinationDiagnosticModal: React.FC<ProcrastinationDiagnosticModalProps> = ({
  onClose,
  onStartTourAfterDiagnosis,
}) => {
  const saveDiagnosisResult = useTrackerStore((s) => s.saveDiagnosisResult)
  const existingProfile = useTrackerStore((s) => s.userProfile)
  const participantName = useTrackerStore((s) => s.participantName)
  const characterId = useTrackerStore((s) => s.characterId)
  const setParticipantProfile = useTrackerStore((s) => s.setParticipantProfile)

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [userName, setUserName] = useState<string>(participantName || '')
  const [obstacle, setObstacle] = useState<ProcrastinationArchetype>(
    existingProfile?.archetype ?? 'OVERWHELMED'
  )
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryAcademicGoal>(
    existingProfile?.primaryGoal ?? 'THESIS'
  )
  const [focusStyle, setFocusStyle] = useState<PreferredFocusStyle>(
    existingProfile?.focusStyle ?? 'TEN_MIN'
  )
  const [createStarterTask, setCreateStarterTask] = useState(true)

  const evaluatedProfile = evaluateProcrastinationProfile({
    obstacle,
    primaryGoal,
    focusStyle,
  })
  const meta = getArchetypeMetadata(evaluatedProfile.archetype)

  const handleFinish = (startTour: boolean) => {
    if (userName.trim()) {
      setParticipantProfile(userName.trim(), characterId)
    }
    saveDiagnosisResult(evaluatedProfile, createStarterTask)
    onClose()
    if (startTour && onStartTourAfterDiagnosis) {
      setTimeout(() => {
        onStartTourAfterDiagnosis()
      }, 300)
    }
  }

  const displayName = userName.trim() || 'Teman Belajar'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[#C9B99F] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C4A3E] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1E1915]">
                {step < 4 ? 'Diagnosis Gaya Belajar & Prokrastinasi' : 'Hasil Analisis & Profil Belajar'}
              </h2>
              <p className="text-xs text-[#5C5148] font-medium">
                {step < 4 ? `Langkah ${step} dari 3` : `Disusun khusus untuk ${displayName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup tes diagnosis"
            className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        {step < 4 && (
          <div className="h-1 bg-[#E2D9C8] w-full">
            <div
              className="h-full bg-[#2C4A3E] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: Nama & Hambatan Utama */}
          {step === 1 && (
            <div className="space-y-3.5">
              {/* Personalized Name Input */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#1E1915]">
                  <User className="w-3.5 h-3.5 text-[#2C4A3E]" />
                  <span>Nama Panggilanmu:</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Contoh: Raden / Nadia / Sarah"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#C9B99F] text-xs font-bold text-[#1E1915] focus:outline-2 focus:outline-[#2C4A3E]"
                />
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-xs font-bold text-[#D4532F] uppercase tracking-wider">
                  Pemicu Utama
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1E1915]">
                  Halo {displayName}! Saat mulai menunda tugas kuliah/skripsi, apa yang paling sering kamu rasakan?
                </h3>
                <p className="text-xs text-[#5C5148]">
                  Pilih kondisi yang paling menggambarkan alasan mengapa tugasmu belum disentuh.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {[
                  {
                    id: 'OVERWHELMED' as const,
                    title: 'Beban Pikiran Terlalu Besar (Overwhelmed)',
                    desc: 'Bingung mulai dari mana karena tugas terlihat terlalu rumit, banyak, dan bikin pusing.',
                    icon: <Layers className="w-4 h-4 text-[#2C4A3E]" />,
                  },
                  {
                    id: 'PERFECTIONIST' as const,
                    title: 'Takut Hasil Kurang Maksimal (Perfeksionis)',
                    desc: 'Takut salah atau merasa riset belum cukup matang, akhirnya terus menunda memulai naskah.',
                    icon: <Target className="w-4 h-4 text-[#B86B14]" />,
                  },
                  {
                    id: 'DEADLINER' as const,
                    title: 'Baru Bisa Gerak Saat Mepet (Deadliner/SKS)',
                    desc: 'Susah ada energi kalau belum H-1 atau beberapa jam sebelum deadline pengumpulan.',
                    icon: <Zap className="w-4 h-4 text-[#D4532F]" />,
                  },
                  {
                    id: 'DISTRACTED' as const,
                    title: 'Gatal Buka Medsos & Cepat Bosan (Distraksi)',
                    desc: 'Baru ngetik 5 menit langsung membuka HP, Instagram/TikTok, atau perhatian melayang.',
                    icon: <Brain className="w-4 h-4 text-[#1F7A4C]" />,
                  },
                ].map((item) => {
                  const isSelected = obstacle === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setObstacle(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#FFFDF9] border-[#2C4A3E] ring-2 ring-[#2C4A3E]/15 shadow-sm'
                          : 'bg-[#FFFDF9]/70 border-[#E2D9C8] hover:border-[#C9B99F]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#2C4A3E]/10' : 'bg-[#F2ECE1]'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold text-[#1E1915]">
                          {item.title}
                        </div>
                        <p className="text-xs text-[#5C5148] font-medium mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          isSelected
                            ? 'bg-[#2C4A3E] border-[#2C4A3E] text-white'
                            : 'border-[#C9B99F]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Target Akademik Terbesar */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#D4532F] uppercase tracking-wider">
                  Target Prioritas
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1E1915]">
                  Apa tanggung jawab akademik terbesar yang sedang kamu hadapi saat ini?
                </h3>
                <p className="text-xs text-[#5C5148]">
                  Kami akan menyiapkan template alur tugas yang cocok untuk jenis tanggung jawab ini.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {[
                  {
                    id: 'THESIS' as const,
                    title: 'Skripsi / Tugas Akhir / Tesis',
                    desc: 'Proyek panjang mandiri yang butuh dicicil konsisten tanpa dorongan jadwal kelas.',
                  },
                  {
                    id: 'COURSEWORK' as const,
                    title: 'Tugas Kuliah & Laporan Praktikum',
                    desc: 'Tumpukan tugas mingguan bertenggat pendek dari dosen yang saling susul-menyusul.',
                  },
                  {
                    id: 'EXAMS' as const,
                    title: 'Belajar Teori Kuliah & Persiapan Ujian',
                    desc: 'Membaca modul, memahami rumus, atau mengulang materi kuliah agar siap UTS/UAS.',
                  },
                  {
                    id: 'ROUTINE' as const,
                    title: 'Membangun Rutinitas Harian Kampus',
                    desc: 'Ingin lebih teratur setiap hari dan menghentikan rasa bersalah karena membuang waktu.',
                  },
                ].map((item) => {
                  const isSelected = primaryGoal === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPrimaryGoal(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#FFFDF9] border-[#2C4A3E] ring-2 ring-[#2C4A3E]/15 shadow-sm'
                          : 'bg-[#FFFDF9]/70 border-[#E2D9C8] hover:border-[#C9B99F]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold text-[#1E1915]">
                          {item.title}
                        </div>
                        <p className="text-xs text-[#5C5148] font-medium mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#2C4A3E] border-[#2C4A3E] text-white'
                            : 'border-[#C9B99F]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Gaya Waktu Fokus */}
          {step === 3 && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#D4532F] uppercase tracking-wider">
                  Kapasitas Atensi
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1E1915]">
                  Berapa lama rentang waktu yang paling realistis untukmu saat mulai fokus?
                </h3>
                <p className="text-xs text-[#5C5148]">
                  Pilih durasi yang tidak membuatmu merasa tersiksa atau malas membayangkan memulainya.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  {
                    id: 'TEN_MIN' as const,
                    title: '10 Menit Dulu',
                    badge: 'Paling Ringan',
                    desc: 'Cukup 10 menit tanpa paksaan. Begitu 10 menit lewat, bebas lanjut atau istirahat.',
                  },
                  {
                    id: 'POMODORO' as const,
                    title: 'Pomodoro (Siklus Rehat)',
                    badge: 'Klasik Teratur',
                    desc: 'Fokus penuh diselingi jeda istirahat sejenak untuk stamina berkelanjutan.',
                  },
                  {
                    id: 'FLOW' as const,
                    title: '45 Menit (Deep Sprint)',
                    badge: 'Fokus Dalam',
                    desc: 'Sprint mendalam tanpa jeda terlalu cepat saat konsentrasi sedang tinggi.',
                  },
                  {
                    id: 'FLEXIBLE' as const,
                    title: 'Fleksibel',
                    badge: 'Bebas Santai',
                    desc: 'Sesuai mood dan suasana hati hari ini, mengalir tanpa timer kaku.',
                  },
                ].map((item) => {
                  const isSelected = focusStyle === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFocusStyle(item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#FFFDF9] border-[#2C4A3E] ring-2 ring-[#2C4A3E]/15 shadow-sm'
                          : 'bg-[#FFFDF9]/70 border-[#E2D9C8] hover:border-[#C9B99F]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-extrabold text-[#1E1915]">
                            {item.title}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#2C4A3E] text-white'
                                : 'bg-[#F2ECE1] text-[#5C5148]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C5148] font-medium leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Hasil Diagnosis & Rekomendasi Personal */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#2C4A3E]/30 p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#2C4A3E]/10 text-[#2C4A3E] text-xs font-black uppercase tracking-wider">
                    Profil Belajar {displayName}
                  </span>
                  <span className="text-xs text-[#8C7E72] font-semibold">{meta.subtitle}</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#1E1915] leading-snug">
                    {meta.title}
                  </h3>
                  <p className="text-xs text-[#5C5148] mt-1 font-medium leading-relaxed">
                    {meta.coreObstacle}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F8F5] border border-[#D1E6D8] space-y-1">
                  <span className="text-[11px] font-extrabold text-[#1F7A4C] uppercase tracking-wide block">
                    Penjelasan Sains Perilaku:
                  </span>
                  <p className="text-xs text-[#2C4A3E] leading-relaxed">
                    {meta.scientificExplanation}
                  </p>
                </div>
              </div>

              {/* Automatic Adaptations */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <h4 className="text-xs font-black text-[#1E1915] uppercase tracking-wider">
                  Penyesuaian Otomatis Aplikasi untukmu:
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#2C4A3E] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1E1915]">
                        Papan Kerja Utama: {meta.frameworkName}
                      </span>
                      <p className="text-xs text-[#5C5148] mt-0.5 leading-relaxed">
                        {meta.frameworkReason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#2C4A3E] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1E1915]">
                        Prinsip Harian: &ldquo;{meta.dailyMotto}&rdquo;
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Starter Task Checkbox */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E2D9C8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={createStarterTask}
                  onChange={(e) => setCreateStarterTask(e.target.checked)}
                  className="w-4 h-4 accent-[#2C4A3E] rounded shrink-0 cursor-pointer"
                />
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-[#1E1915] block">
                    Buatkan 1 tugas latihan awal di meja hari ini
                  </span>
                  <span className="text-xs text-[#5C5148] block mt-0.5">
                    Lengkap dengan 3 sub-langkah kecil dan pemicu mulai 2 menit.
                  </span>
                </div>
              </label>

              {/* Re-test info note */}
              <div className="p-3 rounded-xl bg-[#F2ECE1]/60 border border-[#E2D9C8] flex items-start gap-2 text-xs text-[#5C5148]">
                <HelpCircle className="w-4 h-4 text-[#8C7E72] shrink-0 mt-0.5" />
                <span>
                  Profil diagnosis ini tersimpan aman di perangkatmu. Kamu bisa mengulang atau memperbaruinya kapan saja melalui menu <strong>Sidebar &rarr; Diagnosis Gaya Belajar</strong>.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-5 py-3.5 bg-[#FFFDF9] border-t border-[#E2D9C8] flex items-center justify-between shrink-0 flex-wrap gap-2">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          ) : step === 4 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
            >
              Ubah Jawaban
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#20372E] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              <span>Lanjut</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#20372E] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              <span>Lihat Hasil Analisis</span>
              <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFinish(false)}
                className="px-4 py-2.5 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-bold cursor-pointer transition-colors"
              >
                Terapkan Langsung
              </button>
              <button
                type="button"
                onClick={() => handleFinish(true)}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#20372E] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <span>Terapkan &amp; Ikuti Tur Panduan 🚀</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
