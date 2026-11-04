// src/components/FloatingSwitcherDock.tsx - Bottom Floating Switcher Dock (Shadcn aesthetic)
import React, { useState } from 'react'
import {
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
  { id: 'KANBAN', label: 'Kanban', icon: <Kanban className="w-4 h-4" /> },
  { id: 'EISENHOWER', label: 'Eisenhower', icon: <Grid2X2 className="w-4 h-4" /> },
  { id: 'ONE_THREE_FIVE', label: '1-3-5', icon: <Layers className="w-4 h-4" /> },
  { id: 'IVY_LEE', label: 'Ivy Lee', icon: <ListOrdered className="w-4 h-4" /> },
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
      {/* Quick Board View Picker Popover */}
      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowPicker(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 mb-2 max-w-[92vw] overflow-x-auto no-scrollbar bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-1.5 shadow-xl flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
            {VIEWS.map((v) => {
              const isSelected = activeBoardView === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setActiveBoardView(v.id)
                    setShowPicker(false)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#2C4A3E] text-white shadow-2xs'
                      : 'text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {v.icon}
                  <span>{v.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Main Floating Island Dock */}
      <div className="bg-[#1E1915]/95 backdrop-blur-md text-[#FAF7F2] p-1.5 rounded-full shadow-2xl border border-[#5C5148]/60 flex items-center gap-2">
        {/* Left: View Switcher Trigger */}
        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          aria-label="Ganti tampilan papan"
          title={`Tampilan saat ini: ${currentView.label}. Klik untuk ganti.`}
          className="min-h-[44px] px-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {currentView.icon}
          <span className="hidden sm:inline">{currentView.label}</span>
        </button>

        {/* Center: Dominant '+' Add Task Action */}
        <button
          type="button"
          onClick={onOpenNewTask}
          aria-label="Tambah Tugas Baru"
          title="Tambah tugas baru (Shortcut)"
          className="w-12 h-12 rounded-full bg-[#D4532F] hover:bg-[#B84322] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-6 h-6 stroke-[2.75]" />
        </button>

        {/* Right: Quick Focus Timer Trigger */}
        <button
          type="button"
          onClick={onOpenFocusTimer}
          aria-label="Mulai Timer Fokus"
          title="Buka timer fokus 10 menit / Pomodoro"
          className="min-h-[44px] px-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Timer className="w-4 h-4 text-[#D4532F]" strokeWidth={2} />
          <span className="hidden sm:inline">Fokus</span>
        </button>
      </div>
    </div>
  )
}
