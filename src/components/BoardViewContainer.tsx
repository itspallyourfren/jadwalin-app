// src/components/BoardViewContainer.tsx - Multi-Framework Board with Spreadsheet-style Condition Dropdowns & Categorization
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronRight,
  Columns2,
  Columns3,
  FolderTree,
  Maximize2,
  Minimize2,
  Plus,
  Sparkles,
  TableProperties,
} from 'lucide-react'
import {
  groupTasksByKanbanCategory,
  groupTasksByKanbanStage,
  sortKanbanColumnTasks,
} from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { TaskCard } from './TaskCard'
import { KanbanSpreadsheetTable } from './KanbanSpreadsheetTable'
import { EisenhowerView } from './EisenhowerView'
import { OneThreeFiveView } from './OneThreeFiveView'
import { IvyLeeView } from './IvyLeeView'
import type {
  KanbanGroupingMode,
  KanbanStatus,
  TaskCategory,
  TimeBlockTag,
  TrackerTask,
} from '../data/types'

type BoardViewContainerProps = {
  isMobile?: boolean
  onOpenDetail: (task: TrackerTask) => void
  onStartFocusTimer: (task: TrackerTask) => void
  onOpenNewTask: () => void
  onOpenDiagnostic: () => void
}

const TIME_OPTIONS: Array<{ value: TimeBlockTag | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Semua' },
  { value: 'Pagi', label: 'Pagi' },
  { value: 'Siang', label: 'Siang' },
  { value: 'Sore', label: 'Sore' },
  { value: 'Malam', label: 'Malam' },
]

export const BoardViewContainer: React.FC<BoardViewContainerProps> = ({
  isMobile,
  onOpenDetail,
  onStartFocusTimer,
  onOpenNewTask,
  onOpenDiagnostic,
}) => {
  const tasks = useTrackerStore((s) => s.tasks)
  const activeBoardView = useTrackerStore((s) => s.activeBoardView)
  const activeMobileKanbanTab = useTrackerStore((s) => s.activeMobileKanbanTab)
  const setActiveMobileKanbanTab = useTrackerStore((s) => s.setActiveMobileKanbanTab)
  const activeTimeFilter = useTrackerStore((s) => s.activeTimeFilter)
  const setActiveTimeFilter = useTrackerStore((s) => s.setActiveTimeFilter)
  const hasCompletedDiagnosis = useTrackerStore((s) => s.hasCompletedDiagnosis)

  // Kanban Workflow Categorization & Spreadsheet Table States
  const [kanbanGrouping, setKanbanGrouping] = useState<KanbanGroupingMode>('STAGE')
  const [stageViewMode, setStageViewMode] = useState<'COMPACT_3' | 'EXPANDED_5'>('COMPACT_3')
  const [autoCollapseEmpty, setAutoCollapseEmpty] = useState(true)
  const [manuallyExpanded, setManuallyExpanded] = useState<Record<string, boolean>>({})
  const [activeSubFilter, setActiveSubFilter] = useState<'ALL' | KanbanStatus>('ALL')
  const [activeCategoryTab, setActiveCategoryTab] = useState<TaskCategory>('Kuliah & Tugas')

  const stageTasks = groupTasksByKanbanStage(tasks, activeTimeFilter)
  const categoryTasks = groupTasksByKanbanCategory(tasks, activeTimeFilter)
  const allFilteredTasks = sortKanbanColumnTasks(tasks, activeTimeFilter)

  const toggleManualCollapse = (status: string) => {
    setManuallyExpanded((prev) => ({
      ...prev,
      [status]: !prev[status],
    }))
  }

  const renderKanbanView = () => {
    // Active tasks combined for 3-column spacious mode
    const activeTasksList = [
      ...stageTasks.IN_PROGRESS,
      ...stageTasks.RESEARCH,
      ...stageTasks.REVIEW,
      ...stageTasks.BLOCKED,
    ]

    const filteredActiveTasks =
      activeSubFilter === 'ALL'
        ? activeTasksList
        : activeTasksList.filter((t) => t.status === activeSubFilter)

    // 3 Core Columns (Wide, spacious, non-cramped default)
    const core3Columns = [
      {
        status: 'BACKLOG' as KanbanStatus,
        title: 'Laci / Antrean',
        shortTitle: 'Laci',
        items: stageTasks.BACKLOG,
        colorDot: '#8C7E72',
      },
      {
        status: 'IN_PROGRESS' as KanbanStatus,
        title: 'Pengerjaan Aktif',
        shortTitle: 'Dikerjakan',
        items: filteredActiveTasks,
        totalItems: activeTasksList.length,
        colorDot: '#B86B14',
      },
      {
        status: 'COMPLETED' as KanbanStatus,
        title: 'Selesai & Kumpul',
        shortTitle: 'Selesai',
        items: stageTasks.COMPLETED,
        colorDot: '#1F7A4C',
      },
    ]

    // 5 Stages in proper chronological sequence
    const stage5Columns: Array<{
      status: KanbanStatus
      title: string
      shortTitle: string
      items: TrackerTask[]
      colorDot: string
    }> = [
      { status: 'BACKLOG', title: 'Laci / Antrean', shortTitle: 'Laci', items: stageTasks.BACKLOG, colorDot: '#8C7E72' },
      { status: 'RESEARCH', title: 'Riset & Bahan', shortTitle: 'Riset', items: stageTasks.RESEARCH, colorDot: '#2B59C3' },
      { status: 'IN_PROGRESS', title: 'Pengerjaan Aktif', shortTitle: 'Dikerjakan', items: stageTasks.IN_PROGRESS, colorDot: '#B86B14' },
      { status: 'REVIEW', title: 'Review & Revisi', shortTitle: 'Review', items: stageTasks.REVIEW, colorDot: '#6B21A8' },
      { status: 'COMPLETED', title: 'Selesai & Kumpul', shortTitle: 'Selesai', items: stageTasks.COMPLETED, colorDot: '#1F7A4C' },
    ]

    const categoryColumns: Array<{
      category: TaskCategory
      title: string
      items: TrackerTask[]
    }> = [
      { category: 'Kuliah & Tugas', title: 'Kuliah & Tugas', items: categoryTasks['Kuliah & Tugas'] },
      { category: 'Belajar & Ujian', title: 'Belajar & Ujian', items: categoryTasks['Belajar & Ujian'] },
      { category: 'Organisasi & Proyek', title: 'Organisasi & Proyek', items: categoryTasks['Organisasi & Proyek'] },
      { category: 'Pribadi & Kebiasaan', title: 'Pribadi & Kebiasaan', items: categoryTasks['Pribadi & Kebiasaan'] },
    ]

    // Shared Section Renderer for Clean Deduplication
    const renderStageSection = (
      col: {
        status: KanbanStatus
        title: string
        items: TrackerTask[]
        colorDot: string
      },
      options?: {
        subFilterContent?: React.ReactNode
        onCollapse?: () => void
        className?: string
      }
    ) => (
      <section
        key={col.status}
        className={`${options?.className ?? ''} bg-[#F2ECE1]/65 rounded-2xl border border-[#E2D9C8] p-3 space-y-2.5`}
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: col.colorDot }}
            />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#1E1915] truncate">
              {col.title}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFFDF9] text-[#5C5148]">
              {col.items.length}
            </span>
            {options?.onCollapse && (
              <button
                type="button"
                onClick={options.onCollapse}
                title="Ciutkan tahap ini"
                className="w-6 h-6 rounded-lg hover:bg-[#EADBCE] text-[#8C7E72] hover:text-[#1E1915] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {options?.subFilterContent}

        {col.items.length === 0 ? (
          <div className="bg-[#FFFDF9]/60 rounded-xl border border-dashed border-[#C9B99F] p-5 text-center space-y-2">
            <p className="text-xs font-semibold text-[#5C5148]">
              Belum ada tugas di tahap ini.
            </p>
            {tasks.length > 0 && col.status === 'IN_PROGRESS' && (
              <button
                type="button"
                onClick={onOpenNewTask}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2C4A3E] text-white text-xs font-bold cursor-pointer hover:bg-[#1E332B] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tugas</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {col.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onOpenDetail={onOpenDetail}
                  onStartFocusTimer={onStartFocusTimer}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    )

    // Sleek Vertical Collapsed Ribbon for Empty Stages
    const renderCollapsedRibbon = (col: {
      status: KanbanStatus
      title: string
      items: TrackerTask[]
      colorDot: string
    }) => (
      <motion.button
        key={col.status}
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => toggleManualCollapse(col.status)}
        title={`Buka tahap ${col.title} (${col.items.length} tugas)`}
        className="w-11 sm:w-12 min-h-[360px] bg-[#F2ECE1]/65 hover:bg-[#EADBCE] rounded-2xl border border-[#E2D9C8] p-2 flex flex-col items-center justify-between cursor-pointer transition-colors shadow-2xs shrink-0 select-none"
      >
        <div className="flex flex-col items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
            style={{ backgroundColor: col.colorDot }}
          />
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#FFFDF9] text-[#5C5148] border border-[#E2D9C8]">
            {col.items.length}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
          <span
            className="text-xs font-extrabold text-[#5C5148] tracking-wider whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {col.title}
          </span>
        </div>

        <div className="text-[#8C7E72] hover:text-[#1E1915] pb-1">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </motion.button>
    )

    return (
      <div className="space-y-3.5">
        {/* 1. Kanban Grouping Toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-0.5">
          <div className="flex items-center gap-1 bg-[#F2ECE1] p-1 rounded-2xl border border-[#E2D9C8] overflow-x-auto no-scrollbar max-w-full">
            <button
              type="button"
              onClick={() => setKanbanGrouping('STAGE')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                kanbanGrouping === 'STAGE'
                  ? 'bg-[#2C4A3E] text-white shadow-2xs'
                  : 'text-[#5C5148] hover:text-[#1E1915]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Tahap Pengerjaan</span>
            </button>

            <button
              type="button"
              onClick={() => setKanbanGrouping('CATEGORY')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                kanbanGrouping === 'CATEGORY'
                  ? 'bg-[#2C4A3E] text-white shadow-2xs'
                  : 'text-[#5C5148] hover:text-[#1E1915]'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Kategori Tugas</span>
            </button>

            <button
              type="button"
              onClick={() => setKanbanGrouping('TABLE')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                kanbanGrouping === 'TABLE'
                  ? 'bg-[#2C4A3E] text-white shadow-2xs'
                  : 'text-[#5C5148] hover:text-[#1E1915]'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Tabel Spreadsheet</span>
            </button>
          </div>

          {/* Sub-Mode Selector for Stage View (3 Kolom Lega vs 5 Alur Lengkap) - Hidden on Mobile */}
          {kanbanGrouping === 'STAGE' && (
            <div className="hidden md:flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center bg-[#F2ECE1] p-0.5 rounded-xl border border-[#E2D9C8]">
                <button
                  type="button"
                  onClick={() => setStageViewMode('COMPACT_3')}
                  title="Tampilan 3 Kolom Utama (Luas & Bebas Sesak)"
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    stageViewMode === 'COMPACT_3'
                      ? 'bg-[#FFFDF9] text-[#1E1915] shadow-2xs'
                      : 'text-[#5C5148] hover:text-[#1E1915]'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>3 Kolom (Lega)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStageViewMode('EXPANDED_5')}
                  title="Tampilan 5 Tahap Alur Lengkap (Skripsi/Proyek)"
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    stageViewMode === 'EXPANDED_5'
                      ? 'bg-[#FFFDF9] text-[#1E1915] shadow-2xs'
                      : 'text-[#5C5148] hover:text-[#1E1915]'
                  }`}
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  <span>5 Alur Detail</span>
                </button>
              </div>

              {stageViewMode === 'EXPANDED_5' && (
                <button
                  type="button"
                  onClick={() => setAutoCollapseEmpty((prev) => !prev)}
                  title={
                    autoCollapseEmpty
                      ? 'Sedang ciutkan tahap kosong. Klik untuk buka semua.'
                      : 'Klik untuk ciutkan tahap kosong otomatis.'
                  }
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    autoCollapseEmpty
                      ? 'bg-[#FFFDF9] text-[#2C4A3E] border-[#2C4A3E]/30 shadow-2xs'
                      : 'bg-[#F2ECE1] text-[#5C5148] border-[#E2D9C8]'
                  }`}
                >
                  {autoCollapseEmpty ? (
                    <Minimize2 className="w-3.5 h-3.5 text-[#2C4A3E]" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-[#5C5148]" />
                  )}
                  <span className="hidden sm:inline">
                    {autoCollapseEmpty ? 'Tahap Kosong Diciutkan' : 'Buka Semua Tahap'}
                  </span>
                </button>
              )}
            </div>
          )}

          {kanbanGrouping !== 'STAGE' && (
            <div className="text-xs font-semibold text-[#8C7E72] hidden sm:block">
              {allFilteredTasks.length} target tugas
            </div>
          )}
        </div>

        {/* 2A. MODE: STAGE (Adaptive 3 Columns or Collapsible 5 Stages) */}
        {kanbanGrouping === 'STAGE' && (
          <div className="space-y-3.5">
            {/* SUB-VIEW A: 3 CORE COLUMNS (Wide, Non-Cramped, Highly Focused) */}
            {stageViewMode === 'COMPACT_3' && (
              <div className="space-y-3.5">
                {/* Mobile Segmented Tabs for 3 Core Stages */}
                <div
                  className={`${
                    isMobile ? 'flex' : 'flex md:hidden'
                  } bg-[#F2ECE1] p-1 rounded-2xl border border-[#E2D9C8] gap-1 overflow-x-auto no-scrollbar`}
                >
                  {core3Columns.map((col) => {
                    const active =
                      activeMobileKanbanTab === col.status ||
                      (col.status === 'IN_PROGRESS' &&
                        activeMobileKanbanTab !== 'BACKLOG' &&
                        activeMobileKanbanTab !== 'COMPLETED')
                    return (
                      <motion.button
                        key={col.status}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setActiveMobileKanbanTab(col.status)}
                        className={`relative flex-1 min-w-[80px] min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                          active ? 'text-[#1E1915]' : 'text-[#5C5148] hover:text-[#1E1915]'
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="activeMobileKanbanTabPill3"
                            className="absolute inset-0 bg-[#FFFDF9] rounded-xl shadow-2xs border border-[#C9B99F]/50"
                            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                          />
                        )}
                        <span
                          className="w-2 h-2 rounded-full relative z-10 shrink-0"
                          style={{ backgroundColor: col.colorDot }}
                        />
                        <span className="relative z-10 truncate">{col.shortTitle}</span>
                        <span
                          className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            active ? 'bg-[#2C4A3E] text-white' : 'bg-[#E2D9C8] text-[#5C5148]'
                          }`}
                        >
                          {col.items.length}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Desktop 3 Columns (Spacious ~33% width each) */}
                <div
                  className={
                    isMobile
                      ? 'grid grid-cols-1 gap-3'
                      : 'grid grid-cols-1 md:grid-cols-3 gap-3.5 items-start'
                  }
                >
                  {core3Columns.map((col) => {
                    const visibleOnMobile =
                      activeMobileKanbanTab === col.status ||
                      (col.status === 'IN_PROGRESS' &&
                        activeMobileKanbanTab !== 'BACKLOG' &&
                        activeMobileKanbanTab !== 'COMPLETED')

                    const subFilterContent =
                      col.status === 'IN_PROGRESS' && activeTasksList.length > 0 ? (
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 pb-0.5">
                          <button
                            type="button"
                            onClick={() => setActiveSubFilter('ALL')}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                              activeSubFilter === 'ALL'
                                ? 'bg-[#1E1915] text-white shadow-2xs'
                                : 'bg-[#FFFDF9] text-[#5C5148] hover:text-[#1E1915] border border-[#E2D9C8]'
                            }`}
                          >
                            Semua ({activeTasksList.length})
                          </button>
                          {stageTasks.RESEARCH.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveSubFilter('RESEARCH')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                activeSubFilter === 'RESEARCH'
                                  ? 'bg-[#2B59C3] text-white shadow-2xs'
                                  : 'bg-[#FFFDF9] text-[#2B59C3] hover:bg-[#EBF1FF] border border-[#BDD4F8]'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2B59C3]" />
                              <span>Riset ({stageTasks.RESEARCH.length})</span>
                            </button>
                          )}
                          {stageTasks.IN_PROGRESS.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveSubFilter('IN_PROGRESS')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                activeSubFilter === 'IN_PROGRESS'
                                  ? 'bg-[#B86B14] text-white shadow-2xs'
                                  : 'bg-[#FFFDF9] text-[#B86B14] hover:bg-[#FEF3E2] border border-[#FAD6A5]'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B86B14]" />
                              <span>Eksekusi ({stageTasks.IN_PROGRESS.length})</span>
                            </button>
                          )}
                          {stageTasks.REVIEW.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveSubFilter('REVIEW')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                activeSubFilter === 'REVIEW'
                                  ? 'bg-[#6B21A8] text-white shadow-2xs'
                                  : 'bg-[#FFFDF9] text-[#6B21A8] hover:bg-[#F5EBFF] border border-[#E0C6FF]'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#6B21A8]" />
                              <span>Revisi ({stageTasks.REVIEW.length})</span>
                            </button>
                          )}
                        </div>
                      ) : null

                    return renderStageSection(col, {
                      className: isMobile
                        ? visibleOnMobile
                          ? 'block'
                          : 'hidden'
                        : visibleOnMobile
                        ? 'block'
                        : 'hidden md:block',
                      subFilterContent,
                    })
                  })}
                </div>
              </div>
            )}

            {/* SUB-VIEW B: 5 STAGES WITH SMART COLLAPSIBLE EMPTY RIBBONS */}
            {stageViewMode === 'EXPANDED_5' && (
              <div className="space-y-3.5">
                {/* Mobile Segmented Tabs for 5 Stages */}
                <div
                  className={`${
                    isMobile ? 'flex' : 'flex md:hidden'
                  } bg-[#F2ECE1] p-1 rounded-2xl border border-[#E2D9C8] gap-1 overflow-x-auto no-scrollbar`}
                >
                  {stage5Columns.map((col) => {
                    const active = activeMobileKanbanTab === col.status
                    return (
                      <motion.button
                        key={col.status}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setActiveMobileKanbanTab(col.status)}
                        className={`relative flex-1 min-w-[70px] min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                          active ? 'text-[#1E1915]' : 'text-[#5C5148] hover:text-[#1E1915]'
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="activeMobileKanbanTabPill5"
                            className="absolute inset-0 bg-[#FFFDF9] rounded-xl shadow-2xs border border-[#C9B99F]/50"
                            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                          />
                        )}
                        <span
                          className="w-2 h-2 rounded-full relative z-10 shrink-0"
                          style={{ backgroundColor: col.colorDot }}
                        />
                        <span className="relative z-10 truncate">{col.shortTitle}</span>
                        <span
                          className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            active ? 'bg-[#2C4A3E] text-white' : 'bg-[#E2D9C8] text-[#5C5148]'
                          }`}
                        >
                          {col.items.length}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Desktop 5 Stages with Collapsible Ribbons */}
                <div
                  className={
                    isMobile
                      ? 'grid grid-cols-1 gap-3'
                      : 'flex gap-3 items-start overflow-x-auto no-scrollbar pb-3'
                  }
                >
                  {stage5Columns.map((col) => {
                    const visibleOnMobile = activeMobileKanbanTab === col.status
                    const isCollapsed =
                      !isMobile &&
                      autoCollapseEmpty &&
                      col.items.length === 0 &&
                      !manuallyExpanded[col.status]

                    if (isCollapsed) {
                      return renderCollapsedRibbon(col)
                    }

                    return renderStageSection(col, {
                      className: isMobile
                        ? visibleOnMobile
                          ? 'block'
                          : 'hidden'
                        : 'flex-1 min-w-[280px] max-w-[420px] shrink-0',
                      onCollapse:
                        !isMobile && autoCollapseEmpty
                          ? () => toggleManualCollapse(col.status)
                          : undefined,
                    })
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2B. MODE: CATEGORY (4 Columns of Task Domains) */}
        {kanbanGrouping === 'CATEGORY' && (
          <div className="space-y-3.5">
            {/* Mobile Segmented Tabs for 4 Categories */}
            <div
              className={`${
                isMobile ? 'flex' : 'flex md:hidden'
              } bg-[#F2ECE1] p-1 rounded-2xl border border-[#E2D9C8] gap-1 overflow-x-auto no-scrollbar`}
            >
              {categoryColumns.map((col) => {
                const active = activeCategoryTab === col.category
                return (
                  <motion.button
                    key={col.category}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveCategoryTab(col.category)}
                    className={`relative flex-1 min-w-[80px] min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                      active ? 'text-[#1E1915]' : 'text-[#5C5148] hover:text-[#1E1915]'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeCategoryTabPill"
                        className="absolute inset-0 bg-[#FFFDF9] rounded-xl shadow-2xs border border-[#C9B99F]/50"
                        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                      />
                    )}
                    <span className="relative z-10 truncate">{col.title}</span>
                    <span
                      className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        active ? 'bg-[#2C4A3E] text-white' : 'bg-[#E2D9C8] text-[#5C5148]'
                      }`}
                    >
                      {col.items.length}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Desktop Category Columns Grid */}
            <div
              className={
                isMobile
                  ? 'grid grid-cols-1 gap-3'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start'
              }
            >
              {categoryColumns.map((col) => {
                const visibleOnMobile = activeCategoryTab === col.category
                return (
                  <section
                    key={col.category}
                    className={`${
                      isMobile
                        ? visibleOnMobile
                          ? 'block'
                          : 'hidden'
                        : visibleOnMobile
                        ? 'block'
                        : 'hidden md:block'
                    } bg-[#F2ECE1]/65 rounded-2xl border border-[#E2D9C8] p-3 space-y-2.5`}
                  >
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-xs sm:text-sm font-extrabold text-[#1E1915] truncate">
                        {col.title}
                      </h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFFDF9] text-[#5C5148]">
                        {col.items.length}
                      </span>
                    </div>

                    {col.items.length === 0 ? (
                      <div className="bg-[#FFFDF9]/60 rounded-xl border border-dashed border-[#C9B99F] p-5 text-center space-y-2">
                        <p className="text-xs font-semibold text-[#5C5148]">
                          Belum ada tugas di kategori ini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <AnimatePresence mode="popLayout">
                          {col.items.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onOpenDetail={onOpenDetail}
                              onStartFocusTimer={onStartFocusTimer}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </div>
        )}

        {/* 2C. MODE: TABLE (Spreadsheet Database View) */}
        {kanbanGrouping === 'TABLE' && (
          <KanbanSpreadsheetTable
            tasks={allFilteredTasks}
            onOpenDetail={onOpenDetail}
            onStartFocusTimer={onStartFocusTimer}
          />
        )}
      </div>
    )
  }

  return (
    <main
      id="tutorial-board-container"
      className={`flex-1 overflow-y-auto ${
        isMobile ? 'px-3 py-2.5 pb-32' : 'max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 pb-28'
      }`}
    >
      {/* Streamlined Time Block Filter Chips Bar (Zero Duplicate Framework Tabs) */}
      <div id="tutorial-time-filters" className="mb-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-extrabold text-[#5C5148] mr-1 hidden sm:inline">
            Waktu:
          </span>
          {TIME_OPTIONS.map((opt) => {
            const active = activeTimeFilter === opt.value
            return (
              <motion.button
                key={opt.value}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTimeFilter(opt.value)}
                className={`relative min-h-[32px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  active
                    ? 'text-white'
                    : 'text-[#5C5148] bg-[#F2ECE1]/70 hover:bg-[#F2ECE1] border border-[#E2D9C8]'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTimeFilterPill"
                    className="absolute inset-0 bg-[#1E1915] rounded-xl shadow-2xs"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="mb-4 bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 sm:p-6 text-center space-y-2.5 sm:space-y-3 shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E7F6EE] text-[#1F7A4C] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold text-[#1E1915]">Papan Tugas Masih Bersih</h2>
            <p className="text-xs text-[#5C5148] max-w-sm mx-auto leading-relaxed font-medium">
              {!hasCompletedDiagnosis
                ? 'Yuk ikuti diagnosis singkat 1 menit untuk mengenali gaya prokrastinasimu dan menyesuaikan fitur aplikasi secara otomatis.'
                : 'Papan siap digunakan. Tambahkan tugas kuliah, skripsi, atau target belajarmu hari ini.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenDiagnostic}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#21382F] active:scale-95 text-white text-xs font-extrabold cursor-pointer transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {hasCompletedDiagnosis
                  ? 'Ubah Profil Diagnosis'
                  : 'Mulai Diagnosis (1 Menit)'}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] border border-[#C9B99F] active:scale-95 text-[#1E1915] text-xs font-extrabold cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Tugas Langsung</span>
            </button>
          </div>
        </div>
      )}

      {/* Animated Multi-Framework Board Switcher */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBoardView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {activeBoardView === 'KANBAN' && renderKanbanView()}
          {activeBoardView === 'EISENHOWER' && (
            <EisenhowerView
              tasks={tasks}
              isMobile={isMobile}
              onOpenDetail={onOpenDetail}
              onStartFocusTimer={onStartFocusTimer}
            />
          )}
          {activeBoardView === 'ONE_THREE_FIVE' && (
            <OneThreeFiveView
              tasks={tasks}
              isMobile={isMobile}
              onOpenDetail={onOpenDetail}
              onStartFocusTimer={onStartFocusTimer}
            />
          )}
          {activeBoardView === 'IVY_LEE' && (
            <IvyLeeView
              tasks={tasks}
              onOpenDetail={onOpenDetail}
              onStartFocusTimer={onStartFocusTimer}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
