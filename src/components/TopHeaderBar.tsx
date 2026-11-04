// src/components/TopHeaderBar.tsx - Sleek Minimal Top Bar with Tactile Animations & Shortcut Hints
import React from 'react'
import { motion } from 'framer-motion'
import { Bell, Flame, Keyboard, Menu, Plus, Volume2, VolumeX } from 'lucide-react'
import { calcSeinfeldStreak } from '../engine/studyAndTimerEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import type { BoardFrameworkView } from '../data/types'

type TopHeaderBarProps = {
  isMobile?: boolean
  onToggleSidebar: () => void
  onOpenNotificationModal: () => void
  onOpenBackupModal: () => void
  onOpenNewTask?: () => void
  onOpenShortcutsHelp?: () => void
}

const VIEW_TITLES: Record<BoardFrameworkView, string> = {
  KANBAN: 'Papan Kanban',
  EISENHOWER: 'Matriks Eisenhower',
  ONE_THREE_FIVE: 'Target 1-3-5',
  IVY_LEE: 'Antrean Ivy Lee',
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  isMobile,
  onToggleSidebar,
  onOpenNotificationModal,
  onOpenBackupModal,
  onOpenNewTask,
  onOpenShortcutsHelp,
}) => {
  const activeBoardView = useTrackerStore((s) => s.activeBoardView)
  const completedDates = useTrackerStore((s) => s.completedDates)
  const soundEnabled = useTrackerStore((s) => s.soundEnabled)
  const toggleSound = useTrackerStore((s) => s.toggleSound)
  const streak = calcSeinfeldStreak(completedDates)

  return (
    <header className="bg-[#FAF7F2] border-b border-[#E2D9C8]/80 shrink-0 select-none">
      <div
        className={`mx-auto ${
          isMobile ? 'px-3 py-2' : 'max-w-6xl px-4 sm:px-6 py-2.5'
        } flex items-center justify-between gap-2`}
      >
        {/* Left: Hamburger Menu (Sidebar Trigger) */}
        <div className="flex items-center gap-2 min-w-0">
          <motion.button
            id="tutorial-sidebar-trigger"
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleSidebar}
            aria-label="Buka menu navigasi"
            title="Buka menu navigasi [Tab]"
            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] border border-[#E2D9C8] text-[#1E1915] transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
          >
            <Menu className="w-4 h-4" />
          </motion.button>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold text-[#1E1915] leading-none truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none">
              {VIEW_TITLES[activeBoardView]}
            </h1>
          </div>
        </div>

        {/* Right: Keyboard Shortcuts + Plus Add Task + Streak + Notification Icon */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {!isMobile && onOpenShortcutsHelp && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={onOpenShortcutsHelp}
              title="Daftar tombol pintas keyboard desktop [?]"
              aria-label="Tombol pintas keyboard"
              className="hidden sm:flex min-h-[40px] items-center gap-1.5 px-2.5 rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] border border-[#E2D9C8] text-xs font-bold text-[#5C5148] hover:text-[#1E1915] transition-colors cursor-pointer shadow-2xs"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#2C4A3E]" />
              <span className="hidden md:inline">Pintasan</span>
              <kbd className="px-1.5 py-0.2 rounded bg-[#FAF7F2] border border-[#C9B99F] text-[10px] font-black">
                ?
              </kbd>
            </motion.button>
          )}

          {onOpenNewTask && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={onOpenNewTask}
              aria-label="Tambah tugas baru"
              title="Tambah tugas baru [N]"
              className="hidden sm:flex w-10 h-10 min-w-[40px] rounded-xl bg-[#2C4A3E] hover:bg-[#21382F] text-white transition-colors cursor-pointer items-center justify-center shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4 stroke-[2.75]" />
            </motion.button>
          )}

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenBackupModal}
            title="Rantai konsistensi harian & profil [B]"
            className="min-h-[36px] sm:min-h-[40px] flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] border border-[#E2D9C8] text-[11px] sm:text-xs font-bold text-[#1E1915] transition-colors cursor-pointer shadow-2xs"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                streak.isTodayCompleted
                  ? 'text-[#D4532F] animate-flame-flicker'
                  : 'text-[#8C7E72]'
              }`}
              strokeWidth={2}
            />
            <span>{streak.currentStreak} hr</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Matikan efek suara' : 'Aktifkan efek suara'}
            title={soundEnabled ? 'Efek Suara UI: Aktif (Klik untuk bisukan)' : 'Efek Suara UI: Dibisukan (Klik untuk aktifkan)'}
            className={`w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] rounded-xl border transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-2xs ${
              soundEnabled
                ? 'bg-[#FFFDF9] hover:bg-[#F2ECE1] border-[#E2D9C8] text-[#2C4A3E]'
                : 'bg-[#F2ECE1] hover:bg-[#E2D9C8] border-[#C9B99F] text-[#8C7E72]'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#8C7E72]" />
            )}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onOpenNotificationModal}
            aria-label="Pengingat notifikasi"
            title="Pengingat notifikasi"
            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] border border-[#E2D9C8] text-[#5C5148] hover:text-[#1E1915] transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
          >
            <Bell className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  )
}
