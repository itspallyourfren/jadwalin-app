// src/components/KanbanSpreadsheetTable.tsx - Tabular Spreadsheet Database View for Academic Tasks
import React from 'react'
import { Check, Play } from 'lucide-react'
import type { TrackerTask } from '../data/types'
import { calcTaskProgress } from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { TaskConditionDropdown } from './TaskConditionDropdown'

type KanbanSpreadsheetTableProps = {
  tasks: readonly TrackerTask[]
  onOpenDetail: (task: TrackerTask) => void
  onStartFocusTimer: (task: TrackerTask) => void
}

export const KanbanSpreadsheetTable: React.FC<KanbanSpreadsheetTableProps> = ({
  tasks,
  onOpenDetail,
  onStartFocusTimer,
}) => {
  const moveTaskStatus = useTrackerStore((s) => s.moveTaskStatus)

  return (
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
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#8C7E72]">
                  Belum ada tugas yang tercatat.
                </td>
              </tr>
            ) : (
              tasks.map((t) => {
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
  )
}
