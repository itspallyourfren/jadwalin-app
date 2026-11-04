// src/components/BoardViewContainer.tsx - Multi-Framework Board with Spreadsheet-style Condition Dropdowns & Categorization
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  Columns3,
  Eye,
  FolderTree,
  Play,
  Plus,
  Sparkles,
  TableProperties,
} from 'lucide-react'
import {
  calcTaskProgress,
  getIvyLeeQueue,
  getOneThreeFiveAllocation,
  groupTasksByEisenhower,
  groupTasksByKanbanCategory,
  groupTasksByKanbanStage,
  sortKanbanColumnTasks,
} from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { TaskCard } from './TaskCard'
import { TaskConditionDropdown } from './TaskConditionDropdown'
import type {
  EisenhowerQuadrant,
  KanbanGroupingMode,
  KanbanStatus,
  TaskCategory,
  TimeBlockTag,
  TrackerTask,
} from '../data/types'

type BoardViewContainerProps = {
  isSimulatedMobile: boolean
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
  isSimulatedMobile,
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
  const ivyLeeSingleFocusMode = useTrackerStore((s) => s.ivyLeeSingleFocusMode)
  const setIvyLeeSingleFocusMode = useTrackerStore((s) => s.setIvyLeeSingleFocusMode)
  const setTaskQuadrant = useTrackerStore((s) => s.setTaskQuadrant)
  const setOneThreeFiveSlot = useTrackerStore((s) => s.setOneThreeFiveSlot)
  const setIvyLeeRank = useTrackerStore((s) => s.setIvyLeeRank)
  const hasCompletedDiagnosis = useTrackerStore((s) => s.hasCompletedDiagnosis)
  const moveTaskStatus = useTrackerStore((s) => s.moveTaskStatus)

  // Kanban Workflow Categorization & Spreadsheet Table States
  const [kanbanGrouping, setKanbanGrouping] = useState<KanbanGroupingMode>('STAGE')
  const [activeCategoryTab, setActiveCategoryTab] = useState<TaskCategory>('Kuliah & Tugas')

  const stageTasks = groupTasksByKanbanStage(tasks, activeTimeFilter)
  const categoryTasks = groupTasksByKanbanCategory(tasks, activeTimeFilter)
  const allFilteredTasks = sortKanbanColumnTasks(tasks, activeTimeFilter)

  const renderKanbanView = () => {
    // 5 Stages of Academic Workflow
    const stageColumns: Array<{
      status: KanbanStatus
      title: string
      shortTitle: string
      items: TrackerTask[]
      colorDot: string
    }> = [
      { status: 'IN_PROGRESS', title: 'Pengerjaan Aktif', shortTitle: 'Dikerjakan', items: stageTasks.IN_PROGRESS, colorDot: '#B86B14' },
      { status: 'RESEARCH', title: 'Riset & Bahan', shortTitle: 'Riset', items: stageTasks.RESEARCH, colorDot: '#2B59C3' },
      { status: 'REVIEW', title: 'Review & Revisi', shortTitle: 'Review', items: stageTasks.REVIEW, colorDot: '#6B21A8' },
      { status: 'BACKLOG', title: 'Laci / Antrean', shortTitle: 'Laci', items: stageTasks.BACKLOG, colorDot: '#8C7E72' },
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

    return (
      <div className="space-y-3.5">
        {/* 1. Kanban Grouping Toolbar (Spreadsheet vs Stage vs Category) */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-0.5">
          <div className="flex items-center gap-1 bg-[#F2ECE1] p-1 rounded-2xl border border-[#E2D9C8] overflow-x-auto no-scrollbar max-w-full">
            <button
              type="button"
              onClick={() => setKanbanGrouping('STAGE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                kanbanGrouping === 'TABLE'
                  ? 'bg-[#2C4A3E] text-white shadow-2xs'
                  : 'text-[#5C5148] hover:text-[#1E1915]'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Tabel Spreadsheet</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-[#8C7E72] hidden sm:block">
            {allFilteredTasks.length} target tugas
          </div>
        </div>

        {/* 2A. MODE: STAGE (5 Columns of Academic Workflow) */}
        {kanbanGrouping === 'STAGE' && (
          <div className="space-y-3.5">
            {/* Mobile Segmented Tabs for 5 Stages */}
            <div
              className={`${
                isSimulatedMobile ? 'flex' : 'flex md:hidden'
              } bg-[#F2ECE1] p-1 rounded-2xl border border-[#E2D9C8] gap-1 overflow-x-auto no-scrollbar`}
            >
              {stageColumns.map((col) => {
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
                        layoutId="activeMobileKanbanTabPill"
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

            {/* Desktop Stage Columns Grid */}
            <div
              className={
                isSimulatedMobile
                  ? 'grid grid-cols-1 gap-3'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start'
              }
            >
              {stageColumns.map((col) => {
                const visibleOnMobile = activeMobileKanbanTab === col.status
                return (
                  <section
                    key={col.status}
                    className={`${
                      isSimulatedMobile
                        ? visibleOnMobile
                          ? 'block'
                          : 'hidden'
                        : visibleOnMobile
                        ? 'block'
                        : 'hidden md:block'
                    } bg-[#F2ECE1]/65 rounded-2xl border border-[#E2D9C8] p-3 space-y-2.5`}
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
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFFDF9] text-[#5C5148]">
                        {col.items.length}
                      </span>
                    </div>

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
              })}
            </div>
          </div>
        )}

        {/* 2B. MODE: CATEGORY (4 Columns of Task Domains) */}
        {kanbanGrouping === 'CATEGORY' && (
          <div className="space-y-3.5">
            {/* Mobile Segmented Tabs for 4 Categories */}
            <div
              className={`${
                isSimulatedMobile ? 'flex' : 'flex md:hidden'
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
                isSimulatedMobile
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
                      isSimulatedMobile
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

        {/* 2C. MODE: TABLE (Spreadsheet Cell Dropdown View) */}
        {kanbanGrouping === 'TABLE' && (
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F2ECE1] border-b border-[#E2D9C8] text-[#5C5148] font-bold">
                    <th className="py-2.5 px-3.5">Tugas / Target</th>
                    <th className="py-2.5 px-3">Mata Kuliah</th>
                    <th className="py-2.5 px-3">Skala</th>
                    <th className="py-2.5 px-3">Kondisi / Tahap (Dropdown)</th>
                    <th className="py-2.5 px-3">Progres</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D9C8]/60">
                  {allFilteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#8C7E72]">
                        Belum ada tugas yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    allFilteredTasks.map((t) => {
                      const pct = calcTaskProgress(t)
                      const isDone = t.status === 'COMPLETED'
                      return (
                        <tr
                          key={t.id}
                          onClick={() => onOpenDetail(t)}
                          className="hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-[#1E1915] group-hover:text-[#2C4A3E] leading-snug">
                              {t.title}
                            </div>
                            {t.subtasks.length > 0 && (
                              <div className="text-[11px] text-[#8C7E72] mt-0.5">
                                {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} sub-langkah
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-[#5C5148] font-medium whitespace-nowrap">
                            {t.courseOrContext || '—'}
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F2ECE1] text-[#1E1915]">
                              {t.scale}
                            </span>
                          </td>

                          {/* Spreadsheet Dropdown Condition Cell */}
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <TaskConditionDropdown
                              currentStatus={t.status}
                              onSelectStatus={(next) => moveTaskStatus(t.id, next)}
                              size="sm"
                            />
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-[#F2ECE1] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isDone ? 'bg-[#1F7A4C]' : pct >= 85 ? 'bg-[#1F7A4C]' : 'bg-[#2C4A3E]'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-[#5C5148] tabular-nums">
                                {pct}%
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-[#8C7E72] whitespace-nowrap font-medium">
                            {t.timeBlock !== 'Bebas' ? t.timeBlock : '—'}
                          </td>

                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {!isDone ? (
                              <button
                                type="button"
                                onClick={() => onStartFocusTimer(t)}
                                className="px-2.5 py-1 rounded-lg bg-[#D4532F] hover:bg-[#B84322] text-white text-xs font-bold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-white" />
                                <span>Fokus</span>
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-[#1F7A4C] inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Rampung</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderEisenhowerView = () => {
    const grouped = groupTasksByEisenhower(tasks)
    const quadrants: Array<{
      key: EisenhowerQuadrant
      title: string
      badge: string
      headerStyle: string
      important: boolean
      urgent: boolean
    }> = [
      {
        key: 'DO_FIRST',
        title: 'Penting & Mendesak',
        badge: 'Kerjakan Segera',
        headerStyle: 'text-[#C8432B] bg-[#FDECE8]',
        important: true,
        urgent: true,
      },
      {
        key: 'SCHEDULE',
        title: 'Penting · Tak Mendesak',
        badge: 'Jadwalkan',
        headerStyle: 'text-[#2B59C3] bg-[#EBF1FF]',
        important: true,
        urgent: false,
      },
      {
        key: 'DELEGATE_FAST',
        title: 'Kurang Penting · Mendesak',
        badge: 'Cicil Cepat',
        headerStyle: 'text-[#B86B14] bg-[#FEF3E2]',
        important: false,
        urgent: true,
      },
      {
        key: 'SAVE_LATER',
        title: 'Kurang Penting · Tak Mendesak',
        badge: 'Simpan Nanti',
        headerStyle: 'text-[#5C5148] bg-[#E2D9C8]/70',
        important: false,
        urgent: false,
      },
    ]

    return (
      <div
        className={
          isSimulatedMobile ? 'grid grid-cols-1 gap-3.5' : 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }
      >
        {quadrants.map((q) => (
          <section
            key={q.key}
            className="bg-[#F2ECE1]/65 rounded-2xl border border-[#E2D9C8] p-3 space-y-2.5"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1E1915]">{q.title}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${q.headerStyle}`}>
                  {q.badge}
                </span>
              </div>
              <span className="text-xs font-bold text-[#5C5148]">{grouped[q.key].length}</span>
            </div>

            <div className="space-y-2.5">
              {grouped[q.key].length === 0 ? (
                <p className="text-xs text-[#8C7E72] py-4 text-center">Kosong</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {grouped[q.key].map((task) => (
                    <div key={task.id} className="space-y-1">
                      <TaskCard
                        task={task}
                        onOpenDetail={onOpenDetail}
                        onStartFocusTimer={onStartFocusTimer}
                      />
                      <div className="flex items-center gap-1 px-1 flex-wrap">
                        {quadrants
                          .filter((other) => other.key !== q.key)
                          .map((other) => (
                            <button
                              key={other.key}
                              type="button"
                              onClick={() => setTaskQuadrant(task.id, other.important, other.urgent)}
                              className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#FFFDF9] hover:bg-[#1E1915] hover:text-white border border-[#E2D9C8] text-[#5C5148] transition-colors cursor-pointer"
                            >
                              → {other.badge}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </section>
        ))}
      </div>
    )
  }

  const renderOneThreeFiveView = () => {
    const alloc = getOneThreeFiveAllocation(tasks)
    const sections = [
      {
        slot: 'LARGE_1' as const,
        title: '1 Tugas Besar',
        limit: 1,
        items: alloc.large,
      },
      {
        slot: 'MEDIUM_3' as const,
        title: '3 Tugas Sedang',
        limit: 3,
        items: alloc.medium,
      },
      {
        slot: 'SMALL_5' as const,
        title: '5 Tugas Kecil',
        limit: 5,
        items: alloc.small,
      },
    ]

    return (
      <div className="space-y-4">
        <div
          className={
            isSimulatedMobile ? 'grid grid-cols-1 gap-3.5' : 'grid grid-cols-1 md:grid-cols-3 gap-4'
          }
        >
          {sections.map((sec) => (
            <section
              key={sec.slot}
              className="bg-[#F2ECE1]/65 rounded-2xl border border-[#E2D9C8] p-3 space-y-2.5"
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-[#1E1915]">{sec.title}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFFDF9] text-[#5C5148]">
                  {sec.items.length}/{sec.limit}
                </span>
              </div>

              <div className="space-y-2.5">
                {sec.items.length === 0 ? (
                  <p className="text-xs text-[#8C7E72] py-4 text-center">Belum dipilih</p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {sec.items.map((task) => (
                      <div key={task.id} className="space-y-1">
                        <TaskCard
                          task={task}
                          onOpenDetail={onOpenDetail}
                          onStartFocusTimer={onStartFocusTimer}
                        />
                        <button
                          type="button"
                          onClick={() => setOneThreeFiveSlot(task.id, null)}
                          className="text-xs text-[#8C7E72] hover:text-[#1E1915] px-1 cursor-pointer"
                        >
                          Lepas dari slot
                        </button>
                      </div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </section>
          ))}
        </div>

        {alloc.unassigned.length > 0 && (
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-2">
            <h3 className="text-xs font-bold text-[#5C5148] uppercase tracking-wider">
              Pilih Tugas untuk Target Hari Ini (1-3-5)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {alloc.unassigned.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-bold text-[#1E1915] truncate">{t.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={alloc.isLargeFull}
                      onClick={() => setOneThreeFiveSlot(t.id, 'LARGE_1')}
                      title="Slot 1 Tugas Besar"
                      className="px-2.5 py-1 rounded-lg bg-[#FDECE8] text-[#C8432B] text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      1B
                    </button>
                    <button
                      type="button"
                      disabled={alloc.isMediumFull}
                      onClick={() => setOneThreeFiveSlot(t.id, 'MEDIUM_3')}
                      title="Slot 3 Tugas Sedang"
                      className="px-2.5 py-1 rounded-lg bg-[#FEF3E2] text-[#B86B14] text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      3S
                    </button>
                    <button
                      type="button"
                      disabled={alloc.isSmallFull}
                      onClick={() => setOneThreeFiveSlot(t.id, 'SMALL_5')}
                      title="Slot 5 Tugas Kecil"
                      className="px-2.5 py-1 rounded-lg bg-[#EBF1FF] text-[#2B59C3] text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      5K
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderIvyLeeView = () => {
    const ivy = getIvyLeeQueue(tasks)
    const visibleQueue = ivyLeeSingleFocusMode ? ivy.queued.slice(0, 1) : ivy.queued

    return (
      <div className="space-y-3.5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-[#1E1915]">
            Antrean 6 Prioritas ({ivy.queued.length}/6)
          </span>
          <button
            type="button"
            onClick={() => setIvyLeeSingleFocusMode(!ivyLeeSingleFocusMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              ivyLeeSingleFocusMode
                ? 'bg-[#1E1915] text-white border-[#1E1915]'
                : 'bg-[#FFFDF9] text-[#1E1915] border-[#E2D9C8]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{ivyLeeSingleFocusMode ? 'Fokus #1: Aktif' : 'Fokus #1 Saja'}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {visibleQueue.map((task) => (
              <div key={task.id} className="space-y-1">
                <TaskCard
                  task={task}
                  onOpenDetail={onOpenDetail}
                  onStartFocusTimer={onStartFocusTimer}
                />
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setIvyLeeRank(task.id, r)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          task.ivyLeeRank === r
                            ? 'bg-[#1E1915] text-white shadow-2xs'
                            : 'bg-[#FFFDF9] border border-[#E2D9C8] text-[#5C5148] hover:text-[#1E1915]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIvyLeeRank(task.id, null)}
                    className="text-xs text-[#8C7E72] hover:text-[#1E1915] cursor-pointer"
                  >
                    Lepas
                  </button>
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>

        {ivy.candidates.length > 0 && (
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-2">
            <h3 className="text-xs font-bold text-[#5C5148] uppercase tracking-wider">
              Tambahkan ke Antrean
            </h3>
            <div className="space-y-1.5">
              {ivy.candidates.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-bold text-[#1E1915] truncate">{t.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5, 6].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setIvyLeeRank(t.id, r)}
                        className="px-2.5 py-1 rounded-lg bg-[#FFFDF9] hover:bg-[#1E1915] hover:text-white border border-[#E2D9C8] text-xs font-semibold cursor-pointer"
                      >
                        #{r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <main
      id="tutorial-board-container"
      className={`flex-1 overflow-y-auto ${
        isSimulatedMobile ? 'px-3 py-2.5 pb-32' : 'max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 pb-28'
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
                className={`relative min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
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
        <div className="mb-4 bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-5 sm:p-6 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F6EE] text-[#1F7A4C] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#1E1915]">Papan Tugas Masih Bersih</h2>
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C4A3E] hover:bg-[#21382F] active:scale-95 text-white text-xs font-extrabold cursor-pointer transition-all shadow-sm"
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
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFFDF9] hover:bg-[#F2ECE1] border border-[#C9B99F] active:scale-95 text-[#1E1915] text-xs font-extrabold cursor-pointer transition-all"
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
          {activeBoardView === 'EISENHOWER' && renderEisenhowerView()}
          {activeBoardView === 'ONE_THREE_FIVE' && renderOneThreeFiveView()}
          {activeBoardView === 'IVY_LEE' && renderIvyLeeView()}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
