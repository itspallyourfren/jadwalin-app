// src/components/IvyLeeView.tsx - Ivy Lee 6 Priorities & Single Focus Queue View
import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { Eye } from 'lucide-react'
import type { TrackerTask } from '../data/types'
import { getIvyLeeQueue } from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { TaskCard } from './TaskCard'

type IvyLeeViewProps = {
  tasks: readonly TrackerTask[]
  onOpenDetail: (task: TrackerTask) => void
  onStartFocusTimer: (task: TrackerTask) => void
}

export const IvyLeeView: React.FC<IvyLeeViewProps> = ({
  tasks,
  onOpenDetail,
  onStartFocusTimer,
}) => {
  const ivyLeeSingleFocusMode = useTrackerStore((s) => s.ivyLeeSingleFocusMode)
  const setIvyLeeSingleFocusMode = useTrackerStore((s) => s.setIvyLeeSingleFocusMode)
  const setIvyLeeRank = useTrackerStore((s) => s.setIvyLeeRank)

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
