// src/components/TechniqueToolkitModal.tsx - Clean, Professional Productivity Methods Catalog
import React, { useState } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Grid2X2,
  Kanban,
  Layers,
  ListOrdered,
  Repeat,
  Scissors,
  ShieldAlert,
  Star,
  Timer,
  X,
  Zap,
} from 'lucide-react'
import { TECHNIQUE_CATALOG } from '../data/toolkitData'
import type { TechniqueCatalogItem, TechniqueTier } from '../data/types'

type TechniqueToolkitModalProps = {
  onClose: () => void
  onActivateTechnique: (item: TechniqueCatalogItem) => void
}

const TIER_FILTERS: Array<{ id: TechniqueTier | 'ALL'; label: string }> = [
  { id: 'TIER_1_CORE', label: 'Utama Harian' },
  { id: 'TIER_2_CONTEXTUAL', label: 'Pendukung' },
  { id: 'TIER_3_STUDY', label: 'Metode Belajar' },
  { id: 'ALL', label: 'Semua' },
]

const ACTION_LABELS: Record<TechniqueCatalogItem['linkedActionType'], string> = {
  VIEW_KANBAN: 'Buka di Papan',
  VIEW_EISENHOWER: 'Buka Matriks',
  VIEW_135: 'Buka Target 1-3-5',
  VIEW_IVY_LEE: 'Buka Antrean 6',
  TIMER_10_MIN: 'Mulai 10 Menit',
  TIMER_POMODORO: 'Mulai Pomodoro',
  TIMER_FLOW: 'Mulai Sesi Flow',
  ACTION_CHUNK_TASK: 'Pecah Langkah',
  ACTION_WOOP: 'Buka Rencana Jika–Maka',
  ACTION_STUDY_NOTES: 'Buka Ruang Belajar',
  ACTION_HABIT_REMINDER: 'Atur Pengingat HP',
}

function getTechniqueIcon(id: string, category: TechniqueCatalogItem['categoryLabel']) {
  switch (id) {
    case 'TEK_30':
      return <Kanban className="w-5 h-5 text-[#2C4A3E]" />
    case 'TEK_25':
      return <Grid2X2 className="w-5 h-5 text-[#2B59C3]" />
    case 'TEK_11':
      return <Layers className="w-5 h-5 text-[#B86B14]" />
    case 'TEK_28':
      return <ListOrdered className="w-5 h-5 text-[#1E1915]" />
    case 'TEK_09':
      return <Flame className="w-5 h-5 text-[#D4532F]" />
    case 'TEK_12':
      return <Calendar className="w-5 h-5 text-[#2B59C3]" />
    case 'TEK_01':
      return <Timer className="w-5 h-5 text-[#2C4A3E]" />
    case 'TEK_08':
    case 'TEK_31':
      return <Zap className="w-5 h-5 text-[#D4532F]" />
    case 'TEK_02':
      return <Scissors className="w-5 h-5 text-[#2C4A3E]" />
    case 'TEK_10':
      return <Star className="w-5 h-5 text-[#B86B14]" />
    case 'TEK_06':
      return <CheckCircle2 className="w-5 h-5 text-[#1F7A4C]" />
    case 'TEK_13':
    case 'TEK_14':
      return <ShieldAlert className="w-5 h-5 text-[#C8432B]" />
    case 'TEK_34':
      return <Clock className="w-5 h-5 text-[#B86B14]" />
    case 'TEK_35':
      return <Repeat className="w-5 h-5 text-[#1F7A4C]" />
    case 'TEK_15':
    case 'TEK_16':
    case 'TEK_17':
    case 'TEK_18':
    case 'TEK_20':
      return <Brain className="w-5 h-5 text-[#7C3AED]" />
    default:
      if (category === 'Metode Belajar Aktif') return <BookOpen className="w-5 h-5 text-[#7C3AED]" />
      if (category === 'Pendobrak Malas & Fokus') return <Timer className="w-5 h-5 text-[#D4532F]" />
      return <SparklesFallback className="w-5 h-5 text-[#2C4A3E]" />
  }
}

function SparklesFallback({ className }: { className?: string }) {
  return <CheckCircle2 className={className} />
}

export const TechniqueToolkitModal: React.FC<TechniqueToolkitModalProps> = ({
  onClose,
  onActivateTechnique,
}) => {
  const [selectedTier, setSelectedTier] = useState<TechniqueTier | 'ALL'>('TIER_1_CORE')

  const filtered =
    selectedTier === 'ALL'
      ? TECHNIQUE_CATALOG
      : TECHNIQUE_CATALOG.filter((t) => t.tier === selectedTier)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-3xl rounded-3xl border border-[#C9B99F] shadow-xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-[#1E1915]">
              Panduan &amp; Katalog Teknik Produktivitas
            </h2>
            <p className="text-xs text-[#5C5148] font-medium mt-0.5">
              Metode sains perilaku terbukti untuk mengatasi prokrastinasi dan menjaga konsistensi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup katalog teknik"
            className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Filter Bar */}
        <div className="px-5 py-2.5 bg-[#F2ECE1] border-b border-[#E2D9C8] flex items-center gap-1.5 overflow-x-auto shrink-0">
          {TIER_FILTERS.map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setSelectedTier(tf.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                selectedTier === tf.id
                  ? 'bg-[#2C4A3E] text-white shadow-2xs'
                  : 'bg-[#FFFDF9] text-[#5C5148] hover:text-[#1E1915] border border-[#E2D9C8]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Methods Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => {
            const actionLabel = ACTION_LABELS[item.linkedActionType] ?? 'Terapkan'
            return (
              <div
                key={item.id}
                className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 flex gap-3.5 items-start hover:border-[#C9B99F] transition-colors"
              >
                {/* Modern Icon Box instead of playing card image */}
                <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center shrink-0 shadow-2xs">
                  {getTechniqueIcon(item.id, item.categoryLabel)}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <span className="text-xs font-bold text-[#8C7E72] block uppercase tracking-wider">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#1E1915] leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#D4532F]">
                      {item.indonesianSubtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#5C5148] leading-relaxed font-medium">
                    {item.shortSummary}
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onActivateTechnique(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#2C4A3E] hover:bg-[#1E332B] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
