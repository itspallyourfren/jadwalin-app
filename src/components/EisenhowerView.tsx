// src/components/EisenhowerView.tsx - Eisenhower Priority Matrix View (Urgent vs Important)
import React from 'react'
import { AnimatePresence } from 'framer-motion'
import type { EisenhowerQuadrant, TrackerTask } from '../data/types'
import { groupTasksByEisenhower } from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { TaskCard } from './TaskCard'

type EisenhowerViewProps = {
  tasks: readonly TrackerTask[]
  isMobile?: boolean
  onOpenDetail: (task: TrackerTask) => void
  onStartFocusTimer: (task: TrackerTask) => void
}

export const EisenhowerView: React.FC<EisenhowerViewProps> = ({
  tasks,
  isMobile,
  onOpenDetail,
  onStartFocusTimer,
}) => {
  const setTaskQuadrant = useTrackerStore((s) => s.setTaskQuadrant)
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
        isMobile ? 'grid grid-cols-1 gap-3.5' : 'grid grid-cols-1 md:grid-cols-2 gap-4'
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
