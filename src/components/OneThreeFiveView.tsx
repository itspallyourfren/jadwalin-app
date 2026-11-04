// src/components/OneThreeFiveView.tsx - 1-3-5 Rule Daily Capacity Planner View
import React from 'react'
import { AnimatePresence } from 'framer-motion'
import type { TrackerTask } from '../data/types'
import { getOneThreeFiveAllocation } from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { TaskCard } from './TaskCard'

type OneThreeFiveViewProps = {
  tasks: readonly TrackerTask[]
  isMobile?: boolean
  onOpenDetail: (task: TrackerTask) => void
  onStartFocusTimer: (task: TrackerTask) => void
}

export const OneThreeFiveView: React.FC<OneThreeFiveViewProps> = ({
  tasks,
  isMobile,
  onOpenDetail,
  onStartFocusTimer,
}) => {
  const setOneThreeFiveSlot = useTrackerStore((s) => s.setOneThreeFiveSlot)
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
          isMobile ? 'grid grid-cols-1 gap-3.5' : 'grid grid-cols-1 md:grid-cols-3 gap-4'
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
