// src/components/BoardViewContainer.tsx - Clean, Spacious Multi-Framework Board
import React from 'react'
import { CheckCircle2, Eye, Plus, Sparkles } from 'lucide-react'
import {
  getIvyLeeQueue,
  getOneThreeFiveAllocation,
  groupTasksByEisenhower,
  sortKanbanColumnTasks,
} from '../engine/boardFrameworksEngine'
import { getArchetypeMetadata } from '../engine/procrastinationDiagnosticEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { TaskCard } from './TaskCard'
import type {
  EisenhowerQuadrant,
  KanbanStatus,
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
  const userProfile = useTrackerStore((s) => s.userProfile)

  const backlogTasks = sortKanbanColumnTasks(
    tasks.filter((t) => t.status === 'BACKLOG'),
    activeTimeFilter
  )
  const inProgressTasks = sortKanbanColumnTasks(
    tasks.filter((t) => t.status === 'IN_PROGRESS'),
    activeTimeFilter
  )
  const completedTasks = sortKanbanColumnTasks(
    tasks.filter((t) => t.status === 'COMPLETED'),
    activeTimeFilter
  )

  const renderKanbanView = () => {
    // On mobile tabs, put "Hari Ini" first so users immediately see their active tasks
    const mobileTabsOrder: Array<{
      status: KanbanStatus
      title: string
      items: TrackerTask[]
    }> = [
      { status: 'IN_PROGRESS', title: 'Hari Ini', items: inProgressTasks },
      { status: 'BACKLOG', title: 'Laci Tugas', items: backlogTasks },
      { status: 'COMPLETED', title: 'Selesai', items: completedTasks },
    ]

    const desktopColumns: Array<{
      status: KanbanStatus
      title: string
      items: TrackerTask[]
    }> = [
      { status: 'BACKLOG', title: 'Laci Tugas', items: backlogTasks },
      { status: 'IN_PROGRESS', title: 'Hari Ini', items: inProgressTasks },
      { status: 'COMPLETED', title: 'Selesai', items: completedTasks },
    ]

    return (
      <div className="space-y-3.5">
        {/* Segmented Tab Switcher on Mobile */}
        <div
          className={`${
            isSimulatedMobile ? 'flex' : 'flex md:hidden'
          } bg-[#F2ECE1] p-1 rounded-2xl border border-[#E2D9C8] gap-1`}
        >
          {mobileTabsOrder.map((col) => {
            const active = activeMobileKanbanTab === col.status
            return (
              <button
                key={col.status}
                type="button"
                onClick={() => setActiveMobileKanbanTab(col.status)}
                className={`flex-1 min-h-[42px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  active
                    ? 'bg-[#FFFDF9] text-[#1E1915] shadow-xs'
                    : 'text-[#5C5148] hover:text-[#1E1915]'
                }`}
              >
                <span>{col.title}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    active ? 'bg-[#2C4A3E] text-white' : 'bg-[#E2D9C8] text-[#5C5148]'
                  }`}
                >
                  {col.items.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Columns Grid */}
        <div
          className={
            isSimulatedMobile
              ? 'grid grid-cols-1 gap-3'
              : 'grid grid-cols-1 md:grid-cols-3 gap-4 items-start'
          }
        >
          {desktopColumns.map((col) => {
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
                  <h2 className="text-sm font-bold text-[#1E1915]">{col.title}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFFDF9] text-[#5C5148]">
                    {col.items.length}
                  </span>
                </div>

                {col.items.length === 0 ? (
                  <div className="bg-[#FFFDF9]/60 rounded-xl border border-dashed border-[#C9B99F] p-5 text-center space-y-2">
                    <p className="text-xs font-semibold text-[#5C5148]">
                      {col.status === 'IN_PROGRESS'
                        ? 'Belum ada tugas di meja hari ini.'
                        : col.status === 'BACKLOG'
                        ? 'Laci tugas kosong. Catat tugas kuliah atau proyekmu di sini.'
                        : 'Belum ada tugas selesai. Mulai cicil 1 langkah kecil!'}
                    </p>
                    {col.status !== 'COMPLETED' && tasks.length > 0 && (
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
                    {col.items.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpenDetail={onOpenDetail}
                        onStartFocusTimer={onStartFocusTimer}
                      />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
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
                grouped[q.key].map((task) => (
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
                ))
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
                  sec.items.map((task) => (
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
                  ))
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
      className={`flex-1 overflow-y-auto ${
        isSimulatedMobile ? 'px-3 py-2.5 pb-32' : 'max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 pb-28'
      }`}
    >
      {/* Streamlined Time Block Filter Chips Bar (Zero Duplicate Framework Tabs) */}
      <div className="mb-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-extrabold text-[#5C5148] mr-1 hidden sm:inline">
            Waktu:
          </span>
          {TIME_OPTIONS.map((opt) => {
            const active = activeTimeFilter === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActiveTimeFilter(opt.value)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1E1915] text-white shadow-2xs'
                    : 'text-[#5C5148] bg-[#F2ECE1]/70 hover:bg-[#F2ECE1] border border-[#E2D9C8]'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {hasCompletedDiagnosis && userProfile && (
          <button
            type="button"
            onClick={onOpenDiagnostic}
            className="text-xs font-bold text-[#2C4A3E] hover:underline flex items-center gap-1.5 shrink-0 cursor-pointer py-1.5 px-2.5 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] hover:bg-[#F2ECE1]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4532F]" />
            <span className="hidden sm:inline">Profil:</span>
            <span>{getArchetypeMetadata(userProfile.archetype).title}</span>
          </button>
        )}
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

      {activeBoardView === 'KANBAN' && renderKanbanView()}
      {activeBoardView === 'EISENHOWER' && renderEisenhowerView()}
      {activeBoardView === 'ONE_THREE_FIVE' && renderOneThreeFiveView()}
      {activeBoardView === 'IVY_LEE' && renderIvyLeeView()}
    </main>
  )
}
