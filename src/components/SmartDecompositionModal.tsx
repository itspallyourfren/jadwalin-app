// src/components/SmartDecompositionModal.tsx - Interactive Adaptive Task Strategy & Phase Decomposition
import React, { useState } from 'react'
import {
  Brain,
  Check,
  Clock,
  Flame,
  Lightbulb,
  Sparkles,
  Star,
  Timer,
  X,
  Zap,
} from 'lucide-react'
import {
  generateAdaptiveTaskPlan,
  type DecompositionPreset,
} from '../engine/adaptiveDecompositionEngine'
import type { TrackerTask } from '../data/types'

type SmartDecompositionModalProps = {
  task: TrackerTask
  onClose: () => void
  onApplySteps: (newSteps: Array<{ title: string; isParetoCore: boolean }>) => void
}

const PRESET_OPTIONS: Array<{
  id: DecompositionPreset
  label: string
  icon: React.ReactNode
  shortDesc: string
}> = [
  {
    id: 'URGENT_SPRINT',
    label: 'Sprint Mepet',
    icon: <Zap className="w-3.5 h-3.5 text-[#D4532F]" />,
    shortDesc: 'Potong langkah ekstra, fokus pada draf inti & kumpul di 85%.',
  },
  {
    id: 'BALANCED',
    label: 'Seimbang',
    icon: <Sparkles className="w-3.5 h-3.5 text-[#2C4A3E]" />,
    shortDesc: 'Alur kerja terstruktur dari inisiasi sampai penuntasan.',
  },
  {
    id: 'DEEP_DIVE',
    label: 'Riset Mendalam',
    icon: <Brain className="w-3.5 h-3.5 text-[#7C3AED]" />,
    shortDesc: 'Cocok untuk tugas akhir, dilengkapi tinjauan kritis & verifikasi.',
  },
]

export const SmartDecompositionModal: React.FC<SmartDecompositionModalProps> = ({
  task,
  onClose,
  onApplySteps,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DecompositionPreset>('BALANCED')

  // Generate strategy plan in 0 ms
  const plan = generateAdaptiveTaskPlan(task, { preset: selectedPreset })

  // State to toggle inclusion of individual steps
  const [selectedStepIds, setSelectedStepIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    plan.allSteps.forEach((s) => {
      init[s.id] = true
    })
    return init
  })

  const toggleStep = (id: string) => {
    setSelectedStepIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleApply = () => {
    const stepsToApply = plan.allSteps
      .filter((s) => selectedStepIds[s.id] !== false)
      .map((s) => ({
        title: s.title,
        isParetoCore: s.isParetoCore,
      }))

    if (stepsToApply.length > 0) {
      onApplySteps(stepsToApply)
    }
    onClose()
  }

  const activeCount = plan.allSteps.filter((s) => selectedStepIds[s.id] !== false).length

  return (
    <div className="fixed inset-0 z-60 bg-black/55 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#C9B99F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E7F6EE] border border-[#1F7A4C]/30 flex items-center justify-center text-[#1F7A4C] shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-[#1E1915]">
                  Bantu Pecah Tugas
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#2C4A3E] border border-[#C9B99F]">
                  {plan.domainLabel}
                </span>
              </div>
              <p className="text-xs text-[#5C5148] font-medium mt-0.5">
                Rekomendasi alur pengerjaan praktis berdasarkan jenis tugasmu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup asisten"
            className="p-1.5 rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-extrabold text-[#1E1915] mb-1.5 uppercase tracking-wider">
              Pilih Gaya Pengerjaan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = selectedPreset === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(opt.id)
                      // Reset selected steps for new plan
                      const nextPlan = generateAdaptiveTaskPlan(task, { preset: opt.id })
                      const nextMap: Record<string, boolean> = {}
                      nextPlan.allSteps.forEach((s) => {
                        nextMap[s.id] = true
                      })
                      setSelectedStepIds(nextMap)
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-sm'
                        : 'bg-[#FFFDF9] text-[#1E1915] border-[#E2D9C8] hover:border-[#C9B99F]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {opt.icon}
                      <span className="text-xs font-extrabold">{opt.label}</span>
                    </div>
                    <p
                      className={`text-[11px] leading-snug font-medium ${
                        isSelected ? 'text-white/80' : 'text-[#5C5148]'
                      }`}
                    >
                      {opt.shortDesc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Metric Summary Banner */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4532F]" />
              <span className="text-xs font-extrabold text-[#1E1915]">
                Estimasi Total: ~{plan.totalEstimatedMinutes} menit
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-[#5C5148]">
              <span className="flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-[#2C4A3E]" />
                {plan.recommendedSessions.pomodoroCount} Pomodoro
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#B86B14]" />
                {plan.recommendedSessions.flowSprintCount} Flow Sesi
              </span>
            </div>
          </div>

          {/* Phased Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-extrabold text-[#1E1915] uppercase tracking-wider">
                Rencana Langkah ({activeCount} dipilih)
              </span>
              <span className="text-xs text-[#5C5148] font-medium">
                ★ = Langkah Inti
              </span>
            </div>

            {plan.phases.map((phase, pIdx) => (
              <div
                key={pIdx}
                className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#E2D9C8]/60 pb-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#1E1915]">{phase.phaseName}</h3>
                    <p className="text-xs text-[#5C5148]">{phase.purpose}</p>
                  </div>
                  <span className="text-xs font-bold text-[#8C7E72] tabular-nums shrink-0">
                    ~{phase.estimatedMinutes}m
                  </span>
                </div>

                <div className="space-y-2">
                  {phase.steps.map((st) => {
                    const isChecked = selectedStepIds[st.id] !== false
                    return (
                      <label
                        key={st.id}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#FAF7F2] border-[#C9B99F]'
                            : 'bg-[#FFFDF9] border-[#E2D9C8]/60 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStep(st.id)}
                          className="mt-0.5 w-4 h-4 accent-[#2C4A3E] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1E1915] leading-snug">
                            {st.title}
                          </p>
                          {st.starterTrigger && (
                            <p className="text-xs text-[#D4532F] font-semibold mt-0.5">
                              Langkah Awal: {st.starterTrigger}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {st.isParetoCore && (
                            <span
                              title="Langkah Inti"
                              className="px-2 py-0.5 rounded bg-[#FEF3E2] text-[#B86B14] text-xs font-extrabold flex items-center gap-1"
                            >
                              <Star className="w-3.5 h-3.5 fill-[#B86B14]" />
                              <span>Inti</span>
                            </span>
                          )}
                          <span className="text-xs font-medium text-[#8C7E72] tabular-nums">
                            {st.estimatedMinutes}m
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Behavioral Techniques Box */}
          <div className="bg-[#FAF7F2] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1E1915]">
              <Lightbulb className="w-4 h-4 text-[#D4532F]" />
              <span>Tips Memulai:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.recommendedTechniques.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] space-y-0.5"
                >
                  <p className="text-xs font-extrabold text-[#2C4A3E]">{rec.name}</p>
                  <p className="text-xs text-[#5C5148] leading-snug font-medium">{rec.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#FFFDF9] border-t border-[#E2D9C8] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F2ECE1] text-xs font-bold text-[#5C5148] cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            disabled={activeCount === 0}
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#1E332B] disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan {activeCount} Langkah ke Tugas</span>
          </button>
        </div>
      </div>
    </div>
  )
}
