// src/components/AppSidebar.tsx - Hybrid Responsive Sidebar (Desktop Permanent / Mobile Slide-over Sheet)
import React from 'react'
import {
  Bell,
  BookOpen,
  Flame,
  Grid2X2,
  Kanban,
  Layers,
  ListOrdered,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
} from 'lucide-react'
import { CHARACTER_PROFILES } from '../data/constants'
import { calcSeinfeldStreak } from '../engine/studyAndTimerEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { Sheet, SheetClose } from './ui/sheet'
import type { BoardFrameworkView } from '../data/types'

type AppSidebarProps = {
  isMobileDrawerOpen: boolean
  onCloseMobileDrawer: () => void
  isDesktopCollapsed: boolean
  onToggleDesktopCollapse: () => void
  onOpenFocusTimer: () => void
  onOpenToolkit: () => void
  onOpenNotifications: () => void
  onOpenBackup: () => void
  onOpenDiagnostic: () => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileDrawerOpen,
  onCloseMobileDrawer,
  isDesktopCollapsed,
  onToggleDesktopCollapse,
  onOpenFocusTimer,
  onOpenToolkit,
  onOpenNotifications,
  onOpenBackup,
  onOpenDiagnostic,
}) => {
  const activeBoardView = useTrackerStore((s) => s.activeBoardView)
  const setActiveBoardView = useTrackerStore((s) => s.setActiveBoardView)
  const tasks = useTrackerStore((s) => s.tasks)
  const clearAllTasks = useTrackerStore((s) => s.clearAllTasks)
  const participantName = useTrackerStore((s) => s.participantName)
  const characterId = useTrackerStore((s) => s.characterId)
  const completedDates = useTrackerStore((s) => s.completedDates)
  const gameCommitment = useTrackerStore((s) => s.gameCommitment)

  const charProfile = CHARACTER_PROFILES[characterId] ?? CHARACTER_PROFILES['CHR-01']
  const streak = calcSeinfeldStreak(completedDates)

  const activeTasksCount = tasks.filter((t) => t.status !== 'COMPLETED').length

  const handleSelectView = (view: BoardFrameworkView) => {
    setActiveBoardView(view)
    onCloseMobileDrawer()
  }

  // Sidebar Menu Content Structure
  const renderSidebarContent = (isCollapsed: boolean, isMobile: boolean) => (
    <div className="flex flex-col h-full bg-[#FAF7F2] text-[#1E1915] select-none">
      {/* 1. Header: Logo & Branding */}
      <div className="h-14 px-3.5 border-b border-[#E2D9C8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/assets/logo/logo_jadwalin.webp"
            alt="Jadwal-In!"
            className="h-8 w-auto object-contain shrink-0"
          />
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0">
              <span className="text-sm font-extrabold text-[#1E1915] block truncate leading-none">
                Jadwal-In!
              </span>
              <span className="text-xs text-[#5C5148] font-medium block truncate mt-0.5">
                Pocket Planner
              </span>
            </div>
          )}
        </div>

        {isMobile ? (
          <SheetClose onClick={onCloseMobileDrawer} />
        ) : (
          <button
            type="button"
            onClick={onToggleDesktopCollapse}
            aria-label={isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="p-1.5 rounded-lg text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* 2. Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {/* Section A: Papan Kerja */}
        <div className="space-y-1">
          {(!isCollapsed || isMobile) && (
            <div className="px-2 pb-1 text-xs font-bold text-[#8C7E72] uppercase tracking-wider">
              Papan Kerja
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSelectView('KANBAN')}
            title="Papan Kanban (Hari Ini, Laci, Selesai)"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeBoardView === 'KANBAN'
                ? 'bg-[#2C4A3E] text-[#FAF7F2] shadow-2xs'
                : 'text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1]'
            }`}
          >
            <Kanban className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Papan Kanban</span>
            )}
            {(!isCollapsed || isMobile) && (
              <span
                className={`text-xs px-1.5 py-0.2 rounded-md ${
                  activeBoardView === 'KANBAN'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F2ECE1] text-[#5C5148]'
                }`}
              >
                {activeTasksCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectView('EISENHOWER')}
            title="Matriks Eisenhower (Penting vs Mendesak)"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeBoardView === 'EISENHOWER'
                ? 'bg-[#2C4A3E] text-[#FAF7F2] shadow-2xs'
                : 'text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1]'
            }`}
          >
            <Grid2X2 className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Matriks Eisenhower</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectView('ONE_THREE_FIVE')}
            title="The 1-3-5 Rule (1 Besar, 3 Sedang, 5 Kecil)"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeBoardView === 'ONE_THREE_FIVE'
                ? 'bg-[#2C4A3E] text-[#FAF7F2] shadow-2xs'
                : 'text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1]'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Target 1-3-5</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectView('IVY_LEE')}
            title="Antrean 6 Prioritas Ivy Lee"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeBoardView === 'IVY_LEE'
                ? 'bg-[#2C4A3E] text-[#FAF7F2] shadow-2xs'
                : 'text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1]'
            }`}
          >
            <ListOrdered className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Antrean Ivy Lee</span>
            )}
          </button>
        </div>

        {/* Section B: Ruang Fokus & Alat */}
        <div className="space-y-1 pt-1 border-t border-[#E2D9C8]/70">
          {(!isCollapsed || isMobile) && (
            <div className="px-2 pb-1 text-xs font-bold text-[#8C7E72] uppercase tracking-wider">
              Ruang Fokus
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenFocusTimer()
              onCloseMobileDrawer()
            }}
            title="Timer Fokus (10m / Pomodoro / Flow)"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <Timer className="w-4 h-4 text-[#D4532F] shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Timer Fokus</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenToolkit()
              onCloseMobileDrawer()
            }}
            title="Panduan Teknik Produktivitas & Belajar"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#2C4A3E] shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Panduan Teknik</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenDiagnostic()
              onCloseMobileDrawer()
            }}
            title="Diagnosis Gaya Prokrastinasi & Personalisasi"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#B86B14] shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Diagnosis Gaya Belajar</span>
            )}
          </button>
        </div>

        {/* Section C: Pengaturan & Cadangan Data */}
        <div className="space-y-1 pt-1 border-t border-[#E2D9C8]/70">
          {(!isCollapsed || isMobile) && (
            <div className="px-2 pb-1 text-xs font-bold text-[#8C7E72] uppercase tracking-wider">
              Data &amp; Cadangan
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenNotifications()
              onCloseMobileDrawer()
            }}
            title="Pengingat Notifikasi HP & Kebiasaan"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-[#5C5148] shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Pengingat HP</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenBackup()
              onCloseMobileDrawer()
            }}
            title="Cadangan & Pemulihan Data Lokal"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#1F7A4C] shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left truncate">Cadangan Data</span>
            )}
          </button>

          {tasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Kosongkan semua daftar tugas di papan? Tindakan ini akan menghapus tugas saat ini agar papan bersih.')) {
                  clearAllTasks()
                  onCloseMobileDrawer()
                }
              }}
              title="Kosongkan semua tugas untuk pengujian bersih"
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-[#C8432B] hover:bg-[#FDECE8] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="flex-1 text-left truncate">Kosongkan Papan</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 3. Footer: User Profile & Streak */}
      <div className="p-3 border-t border-[#E2D9C8] bg-[#FFFDF9] shrink-0">
        <div
          onClick={() => {
            onOpenBackup()
            onCloseMobileDrawer()
          }}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <img
            src={charProfile.avatar}
            alt={charProfile.name}
            className="w-8 h-8 rounded-full object-cover border border-[#C9B99F] shrink-0"
          />
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#1E1915] truncate">
                {participantName}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#5C5148] font-medium">
                <Flame className="w-3 h-3 text-[#D4532F]" />
                <span>{streak.currentStreak} hr konsisten</span>
                {gameCommitment && <span className="text-[#1F7A4C]">· Kel. {gameCommitment.groupCode}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Sheet */}
      <Sheet open={isMobileDrawerOpen} onClose={onCloseMobileDrawer} side="left">
        {renderSidebarContent(false, true)}
      </Sheet>

      {/* Desktop Persistent Sidebar (Hidden on small mobile screens) */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#E2D9C8] transition-all duration-200 shrink-0 ${
          isDesktopCollapsed ? 'w-16' : 'w-60 lg:w-64'
        }`}
      >
        {renderSidebarContent(isDesktopCollapsed, false)}
      </aside>
    </>
  )
}
