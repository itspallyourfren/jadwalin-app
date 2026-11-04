// src/components/TaskConditionDropdown.tsx - Spreadsheet-style Dropdown Condition Selector
import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { WORKFLOW_STAGES, WORKFLOW_STAGE_ORDER } from '../data/constants'
import type { KanbanStatus } from '../data/types'

type TaskConditionDropdownProps = {
  currentStatus: KanbanStatus
  onSelectStatus: (nextStatus: KanbanStatus) => void
  size?: 'sm' | 'md'
  className?: string
}

export const TaskConditionDropdown: React.FC<TaskConditionDropdownProps> = ({
  currentStatus,
  onSelectStatus,
  size = 'sm',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentConfig = WORKFLOW_STAGES[currentStatus] ?? WORKFLOW_STAGES.IN_PROGRESS

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick)
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Spreadsheet Cell Chip Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Ubah kondisi pengerjaan. Saat ini: ${currentConfig.label}`}
        title={`Kondisi: ${currentConfig.label} (Klik untuk ubah tahap)`}
        className={`rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
          currentConfig.colorBadge
        } ${currentConfig.borderClass} ${
          size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
        }`}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: currentConfig.dotColor }}
        />
        <span className="truncate max-w-[130px]">{currentConfig.label}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-60 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Spreadsheet-style Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 4 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute left-0 mt-1.5 w-60 sm:w-64 bg-[#FFFDF9] rounded-xl border border-[#C9B99F] shadow-xl py-1.5 z-50 overflow-hidden"
          >
            <div className="px-3 py-1 border-b border-[#E2D9C8]/70 text-[10px] font-black text-[#8C7E72] uppercase tracking-wider">
              Kondisi Pengerjaan Tugas
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-[#E2D9C8]/40 py-0.5">
              {WORKFLOW_STAGE_ORDER.map((stageId) => {
                const stage = WORKFLOW_STAGES[stageId]
                const isSelected = currentStatus === stageId

                return (
                  <button
                    key={stageId}
                    type="button"
                    onClick={() => {
                      onSelectStatus(stageId)
                      setIsOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F2ECE1]/80 text-[#1E1915]'
                        : 'hover:bg-[#FAF7F2] text-[#5C5148] hover:text-[#1E1915]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: stage.dotColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-snug flex items-center justify-between gap-1">
                        <span>{stage.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#1F7A4C] stroke-[2.5]" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#8C7E72] leading-tight mt-0.5">
                        {stage.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
