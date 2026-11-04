// src/components/TechniqueToolkitModal.tsx - Clean, Scannable Technique Catalog
import React, { useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
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
        <div className="px-5 py-3.5 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E1915]">Panduan Teknik Produktivitas</h2>
            <p className="text-xs text-[#5C5148]">
              Pilih metode untuk langsung mengaktifkannya di papan atau timer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup katalog teknik"
            className="p-1.5 rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
          >
            <X className="w-4 h-4" />
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
                  ? 'bg-[#2C4A3E] text-white'
                  : 'bg-[#FFFDF9] text-[#5C5148] hover:text-[#1E1915] border border-[#E2D9C8]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 flex gap-3 items-start"
            >
              <img
                src={item.cardAsset}
                alt={item.name}
                className="w-12 h-17 object-cover rounded-lg border border-[#C9B99F] shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div>
                  <span className="text-xs font-semibold text-[#8C7E72]">{item.categoryLabel}</span>
                  <h3 className="text-sm font-bold text-[#1E1915] leading-snug">{item.name}</h3>
                  <p className="text-xs font-semibold text-[#D4532F]">{item.indonesianSubtitle}</p>
                </div>

                <p className="text-xs text-[#5C5148] leading-relaxed">{item.shortSummary}</p>

                <button
                  type="button"
                  onClick={() => onActivateTechnique(item)}
                  className="px-2.5 py-1 rounded-lg bg-[#F2ECE1] hover:bg-[#2C4A3E] hover:text-white text-[#1E1915] text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Pakai</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
