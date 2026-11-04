// src/components/TaskCard.tsx - Minimal, Scannable Task Card with Collapsible Checklist
import React, { useState } from 'react'
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Play,
  Star,
  Undo2,
} from 'lucide-react'
import { calcTaskProgress, isEligibleFor85Rule } from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import type { TrackerTask } from '../data/types'

type TaskCardProps = {
  task: TrackerTask
  onOpenDetail: (task: TrackerTask) => void
  onStartFocusTimer: (task: TrackerTask) => void
}

const SCALE_DOT: Record<TrackerTask['scale'], string> = {
  Kecil: 'text-[#2B59C3] bg-[#EBF1FF]',
  Sedang: 'text-[#B86B14] bg-[#FEF3E2]',
  Besar: 'text-[#C8432B] bg-[#FDECE8]',
  'Tugas Akhir': 'text-[#6B21A8] bg-[#F5EBFF]',
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpenDetail,
  onStartFocusTimer,
}) => {
  const moveTaskStatus = useTrackerStore((s) => s.moveTaskStatus)
  const toggleEatThatFrog = useTrackerStore((s) => s.toggleEatThatFrog)
  const toggleSubtask = useTrackerStore((s) => s.toggleSubtask)
  const completeTaskVia85Rule = useTrackerStore((s) => s.completeTaskVia85Rule)

  const [expandSteps, setExpandSteps] = useState(false)

  const progress = calcTaskProgress(task)
  const canClutch85 = isEligibleFor85Rule(task)
  const isCompleted = task.status === 'COMPLETED'
  const doneSteps = task.subtasks.filter((s) => s.completed).length

  const effectiveDeadline = task.internalDeadlineIso || task.deadlineIso
  const formattedDeadline = effectiveDeadline
    ? new Date(effectiveDeadline).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      })
    : null

  return (
    <article
      onClick={() => onOpenDetail(task)}
      className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 hover:border-[#C9B99F] hover:shadow-sm transition-all flex flex-col gap-2.5 cursor-pointer"
    >
      {/* Row 1: Context + Scale + Pin */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {task.courseOrContext && (
            <>
              <span className="text-xs font-semibold text-[#5C5148] truncate max-w-[140px]">
                {task.courseOrContext}
              </span>
              <span className="text-[#C9B99F]">·</span>
            </>
          )}
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${SCALE_DOT[task.scale]}`}>
            {task.scale}
          </span>
          {task.timeBlock !== 'Bebas' && (
            <span className="text-xs font-semibold text-[#5C5148] px-1.5 py-0.5 bg-[#F2ECE1] rounded-md">
              {task.timeBlock}
            </span>
          )}
          {task.ivyLeeRank !== null && !isCompleted && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#1E1915] text-white">
              #{task.ivyLeeRank}
            </span>
          )}
        </div>

        {!isCompleted && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleEatThatFrog(task.id)
            }}
            title="Prioritas Utama Hari Ini"
            aria-label="Prioritas Utama"
            className={`w-8 h-8 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
              task.isEatThatFrog
                ? 'bg-[#FDECE8] text-[#D4532F]'
                : 'text-[#8C7E72]/60 hover:text-[#1E1915] hover:bg-[#F2ECE1]'
            }`}
          >
            <Flame className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Row 2: Task Title */}
      <h3
        className={`text-[15px] font-bold text-[#1E1915] leading-snug hover:text-[#2C4A3E] break-words ${
          isCompleted ? 'line-through text-[#8C7E72]' : ''
        }`}
      >
        {task.title}
      </h3>

      {/* Row 3: Slim Progress Bar + Deadline + Collapsible Steps Trigger */}
      {!isCompleted && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#F2ECE1] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  progress >= 85 ? 'bg-[#1F7A4C]' : 'bg-[#2C4A3E]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#5C5148] tabular-nums">{progress}%</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-[#5C5148]">
            <div className="flex items-center gap-2.5">
              {task.subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandSteps((v) => !v)
                  }}
                  className="font-semibold text-[#2C4A3E] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>
                    {doneSteps}/{task.subtasks.length} langkah
                  </span>
                  {expandSteps ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {formattedDeadline && (
                <span className="flex items-center gap-1 text-[#8C7E72]">
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDeadline}</span>
                </span>
              )}
            </div>

            {task.focusMinutesLogged > 0 && (
              <span className="text-[#8C7E72]">{task.focusMinutesLogged}m fokus</span>
            )}
          </div>
        </div>
      )}

      {/* Expandable Inline Subtask Checklist (Hidden by Default to Keep Mobile Clean) */}
      {expandSteps && task.subtasks.length > 0 && !isCompleted && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-1.5 pb-1 px-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-1.5"
        >
          {task.subtasks.map((sub) => (
            <label
              key={sub.id}
              className="flex items-start gap-2 text-xs text-[#1E1915] cursor-pointer py-0.5"
            >
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => toggleSubtask(task.id, sub.id)}
                className="mt-0.5 w-3.5 h-3.5 accent-[#2C4A3E] rounded cursor-pointer shrink-0"
              />
              <span
                className={`flex-1 leading-snug ${
                  sub.completed ? 'line-through text-[#8C7E72]' : 'font-medium'
                }`}
              >
                {sub.title}
              </span>
              {sub.isParetoCore && (
                <span title="Langkah inti" className="shrink-0 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-[#B86B14] fill-[#B86B14]" />
                </span>
              )}
            </label>
          ))}
        </div>
      )}

      {/* Row 4: Clean Action Row */}
      <div className="pt-2 border-t border-[#E2D9C8]/60 flex items-center justify-between gap-2 flex-wrap">
        {!isCompleted ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onStartFocusTimer(task)
              }}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#D4532F] hover:bg-[#B84322] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Fokus</span>
            </button>

            <div className="flex items-center gap-1.5 flex-wrap">
              {task.status === 'BACKLOG' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveTaskStatus(task.id, 'IN_PROGRESS')
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#2C4A3E] hover:bg-[#21382F] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Kerjakan Hari Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveTaskStatus(task.id, 'BACKLOG')
                    }}
                    title="Simpan ke Laci"
                    aria-label="Simpan ke Laci"
                    className="min-h-[38px] px-2.5 py-1.5 rounded-xl text-[#8C7E72] hover:text-[#1E1915] hover:bg-[#F2ECE1] text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>

                  {canClutch85 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        completeTaskVia85Rule(task.id)
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#1F7A4C] hover:bg-[#18633C] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Progres sudah 85% — kumpulkan sekarang tanpa ragu"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesai Cukup</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveTaskStatus(task.id, 'COMPLETED')
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#E7F6EE] hover:bg-[#D1EEDE] text-[#1F7A4C] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-xs py-0.5">
            <span className="font-semibold text-[#1F7A4C]">
              Selesai {task.completedVia85Rule ? '(Cukup Baik)' : ''}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                moveTaskStatus(task.id, 'IN_PROGRESS')
              }}
              className="text-[#8C7E72] hover:text-[#1E1915] font-medium cursor-pointer"
            >
              Buka kembali
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
