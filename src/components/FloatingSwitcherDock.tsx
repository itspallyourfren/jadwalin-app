// src/components/FloatingSwitcherDock.tsx - Bottom Floating Switcher Dock with Tactile Spring Animations
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Grid2X2,
  Kanban,
  Layers,
  ListOrdered,
  Plus,
  Timer,
} from 'lucide-react'
import { useTrackerStore } from '../store/useTrackerStore'
import type { BoardFrameworkView } from '../data/types'

type FloatingSwitcherDockProps = {
  onOpenNewTask: () => void
  onOpenFocusTimer: () => void
}

const VIEWS: Array<{ id: BoardFrameworkView; label: string; icon: React.ReactNode }> = [
  { id: 'KANBAN', label: 'Kanban', icon: <Kanban className="w-3.5 h-3.5" /> },
  { id: 'EISENHOWER', label: 'Eisenhower', icon: <Grid2X2 className="w-3.5 h-3.5" /> },
  { id: 'ONE_THREE_FIVE', label: '1-3-5', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'IVY_LEE', label: 'Ivy Lee', icon: <ListOrdered className="w-3.5 h-3.5" /> },
]

export const FloatingSwitcherDock: React.FC<FloatingSwitcherDockProps> = ({
  onOpenNewTask,
  onOpenFocusTimer,
}) => {
  const activeBoardView = useTrackerStore((s) => s.activeBoardView)
  const setActiveBoardView = useTrackerStore((s) => s.setActiveBoardView)
  const [showPicker, setShowPicker] = useState(false)

  const currentView = VIEWS.find((v) => v.id === activeBoardView) ?? VIEWS[0]

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto select-none">
      {/* Quick Board View Picker Popover with Spring Animation */}
      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setShowPicker(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.94 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-40 w-max max-w-[94vw] overflow-x-auto no-scrollbar bg-[#FFFDF9] rounded-2xl border border-[#C9B99F] p-1.5 shadow-xl flex items-center gap-1"
            >
              {VIEWS.map((v) => {
                const isSelected = activeBoardView === v.id
                return (
                  <motion.button
                    key={v.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      setActiveBoardView(v.id)
                      setShowPicker(false)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#2C4A3E] text-white shadow-2xs'
                        : 'text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    {v.icon}
                    <span>{v.label}</span>
                  </motion.button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Symmetrical Paper Sheet Dock with Tactile Feedback */}
      <motion.nav
        aria-label="Navigasi cepat"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="w-max mx-auto bg-[#FFFDF9] text-[#1E1915] p-1.5 px-2 rounded-full shadow-lg border border-[#C9B99F] flex items-center gap-2"
      >
        {/* Left: View Switcher Trigger */}
        <motion.button
          id="tutorial-framework-dock"
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setShowPicker((prev) => !prev)}
          aria-label="Pilih tampilan papan"
          title={`Tampilan saat ini: ${currentView.label}. Klik untuk ganti.`}
          className="min-h-[44px] px-3.5 rounded-full bg-[#F2ECE1] hover:bg-[#EADBCE] text-[#1E1915] text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E2D9C8]"
        >
          {currentView.icon}
          <span>{currentView.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#5C5148] transition-transform duration-200 ${
              showPicker ? 'rotate-180' : ''
            }`}
          />
        </motion.button>

        {/* Center: Dominant '+' Add Task Action with Spring Pop */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenNewTask}
          aria-label="Tambah Tugas Baru"
          title="Tambah tugas baru (Shortcut N)"
          className="w-11 h-11 rounded-full bg-[#D4532F] hover:bg-[#B84322] text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.75]" />
        </motion.button>

        {/* Right: Quick Focus Trigger */}
        <motion.button
          id="tutorial-focus-timer-btn"
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenFocusTimer}
          aria-label="Mulai Timer Fokus"
          title="Buka timer fokus 10 menit / Pomodoro (Shortcut F)"
          className="min-h-[44px] px-3.5 rounded-full bg-[#F2ECE1] hover:bg-[#EADBCE] text-[#1E1915] text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E2D9C8]"
        >
          <Timer className="w-4 h-4 text-[#D4532F]" strokeWidth={2.2} />
          <span>Fokus</span>
        </motion.button>
      </motion.nav>
    </div>
  )
}
