// src/components/TopHeaderBar.tsx - Sleek Minimal Top Bar (No Repetitive Buttons)
import React from 'react'
import { Bell, Flame, Menu, Plus } from 'lucide-react'
import { calcSeinfeldStreak } from '../engine/studyAndTimerEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import type { BoardFrameworkView } from '../data/types'

type TopHeaderBarProps = {
  isSimulatedMobile: boolean
  onToggleSidebar: () => void
  onOpenNotificationModal: () => void
  onOpenBackupModal: () => void
  onOpenNewTask?: () => void
}

const VIEW_TITLES: Record<BoardFrameworkView, string> = {
  KANBAN: 'Papan Kanban',
  EISENHOWER: 'Matriks Eisenhower',
  ONE_THREE_FIVE: 'Target 1-3-5',
  IVY_LEE: 'Antrean Ivy Lee',
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  isSimulatedMobile,
  onToggleSidebar,
  onOpenNotificationModal,
  onOpenBackupModal,
  onOpenNewTask,
}) => {
  const activeBoardView = useTrackerStore((s) => s.activeBoardView)
  const completedDates = useTrackerStore((s) => s.completedDates)
  const streak = calcSeinfeldStreak(completedDates)

  return (
    <header className="bg-[#FAF7F2] border-b border-[#E2D9C8]/80 shrink-0">
      <div
        className={`mx-auto ${
          isSimulatedMobile ? 'px-3 py-2' : 'max-w-6xl px-4 sm:px-6 py-2.5'
        } flex items-center justify-between gap-2`}
      >
        {/* Left: Hamburger Menu (Sidebar Trigger) */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            id="tutorial-sidebar-trigger"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Buka menu navigasi"
            className="w-10 h-10 min-w-[40px] rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] active:scale-95 border border-[#E2D9C8] text-[#1E1915] transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-[#1E1915] leading-none truncate">
              {VIEW_TITLES[activeBoardView]}
            </h1>
          </div>
        </div>

        {/* Right: Plus Add Task + Streak + Notification Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenNewTask && (
            <button
              id="tutorial-add-task-btn"
              type="button"
              onClick={onOpenNewTask}
              aria-label="Tambah tugas baru"
              title="Tambah tugas baru"
              className="w-10 h-10 min-w-[40px] rounded-xl bg-[#2C4A3E] hover:bg-[#21382F] active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4 stroke-[2.75]" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenBackupModal}
            title="Rantai konsistensi harian"
            className="min-h-[40px] flex items-center gap-1.5 px-3 rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] active:scale-95 border border-[#E2D9C8] text-xs font-bold text-[#1E1915] transition-all cursor-pointer"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                streak.isTodayCompleted ? 'text-[#D4532F]' : 'text-[#8C7E72]'
              }`}
              strokeWidth={2}
            />
            <span>{streak.currentStreak} hr</span>
          </button>

          <button
            type="button"
            onClick={onOpenNotificationModal}
            aria-label="Pengingat notifikasi"
            className="w-10 h-10 min-w-[40px] rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] active:scale-95 border border-[#E2D9C8] text-[#5C5148] hover:text-[#1E1915] transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
