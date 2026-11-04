// src/components/TopHeaderBar.tsx - Sleek Minimal Top Bar (No Repetitive Buttons)
import React from 'react'
import { Bell, Flame, Menu } from 'lucide-react'
import { calcSeinfeldStreak } from '../engine/studyAndTimerEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import type { BoardFrameworkView, TimeBlockTag } from '../data/types'

type TopHeaderBarProps = {
  isSimulatedMobile: boolean
  onToggleSidebar: () => void
  onOpenNotificationModal: () => void
  onOpenBackupModal: () => void
}

const VIEW_TITLES: Record<BoardFrameworkView, string> = {
  KANBAN: 'Papan Kanban',
  EISENHOWER: 'Matriks Eisenhower',
  ONE_THREE_FIVE: 'Target 1-3-5',
  IVY_LEE: 'Antrean Ivy Lee',
}

const TIME_FILTER_TAGS: Array<{ value: TimeBlockTag | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Semua' },
  { value: 'Pagi', label: 'Pagi' },
  { value: 'Siang', label: 'Siang' },
  { value: 'Sore', label: 'Sore' },
  { value: 'Malam', label: 'Malam' },
]

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  isSimulatedMobile,
  onToggleSidebar,
  onOpenNotificationModal,
  onOpenBackupModal,
}) => {
  const activeBoardView = useTrackerStore((s) => s.activeBoardView)
  const activeTimeFilter = useTrackerStore((s) => s.activeTimeFilter)
  const setActiveTimeFilter = useTrackerStore((s) => s.setActiveTimeFilter)
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
            type="button"
            onClick={onToggleSidebar}
            aria-label="Buka menu navigasi"
            className="p-2 rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] border border-[#E2D9C8] text-[#1E1915] transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-[#1E1915] leading-none truncate">
              {VIEW_TITLES[activeBoardView]}
            </h1>
          </div>
        </div>

        {/* Center: Compact Time Filter Pills (Pagi / Siang / Sore / Malam) */}
        <div className="hidden sm:flex items-center gap-1 bg-[#F2ECE1]/80 p-0.5 rounded-xl border border-[#E2D9C8]/70">
          {TIME_FILTER_TAGS.map((tf) => {
            const active = activeTimeFilter === tf.value
            return (
              <button
                key={tf.value}
                type="button"
                onClick={() => setActiveTimeFilter(tf.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#FFFDF9] text-[#1E1915] shadow-2xs'
                    : 'text-[#5C5148] hover:text-[#1E1915]'
                }`}
              >
                {tf.label}
              </button>
            )
          })}
        </div>

        {/* Right: Streak & Notification Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenBackupModal}
            title="Rantai konsistensi harian"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] text-xs font-bold text-[#1E1915] cursor-pointer"
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
            className="p-2 rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] border border-[#E2D9C8] text-[#5C5148] hover:text-[#1E1915] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
