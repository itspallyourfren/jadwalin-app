// src/components/TaskCard.tsx - Animated Scannable Task Card with Spreadsheet-style Condition Dropdown
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Play,
  Star,
} from 'lucide-react'
import { calcTaskProgress, isEligibleFor85Rule } from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { TaskConditionDropdown } from './TaskConditionDropdown'
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
    <motion.article
      layout
      tabIndex={0}
      role="button"
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={() => onOpenDetail(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetail(task)
        }
      }}
      className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3 sm:p-3.5 hover:border-[#C9B99F] hover:shadow-xs focus:ring-2 focus:ring-[#2C4A3E]/40 focus:outline-hidden transition-colors flex flex-col gap-2 sm:gap-2.5 cursor-pointer select-none"
    >
      {/* Row 1: Context + Scale + Pin */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {task.courseOrContext && (
            <>
              <span className="text-[11px] sm:text-xs font-semibold text-[#5C5148] truncate max-w-[105px] xs:max-w-[140px]">
                {task.courseOrContext}
              </span>
              <span className="text-[#C9B99F]">·</span>
            </>
          )}
          <span className={`text-[11px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md ${SCALE_DOT[task.scale]}`}>
            {task.scale}
          </span>
          {task.timeBlock !== 'Bebas' && (
            <span className="text-[11px] sm:text-xs font-semibold text-[#5C5148] px-1.5 py-0.5 bg-[#F2ECE1] rounded-md">
              {task.timeBlock}
            </span>
          )}
          {task.ivyLeeRank !== null && !isCompleted && (
            <span className="text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-[#1E1915] text-white">
              #{task.ivyLeeRank}
            </span>
          )}
        </div>

        {!isCompleted && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.stopPropagation()
              toggleEatThatFrog(task.id)
            }}
            title="Prioritas Utama Hari Ini"
            aria-label="Prioritas Utama"
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
              task.isEatThatFrog
                ? 'bg-[#FDECE8] text-[#D4532F]'
                : 'text-[#8C7E72]/60 hover:text-[#1E1915] hover:bg-[#F2ECE1]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
          </motion.button>
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

      {/* Row 3: Animated Progress Bar + Deadline + Collapsible Steps Trigger */}
      {!isCompleted && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#F2ECE1] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  progress >= 85 ? 'bg-[#1F7A4C]' : 'bg-[#2C4A3E]'
                }`}
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

      {/* Expandable Inline Subtask Checklist with Smooth Height Animation */}
      <AnimatePresence>
        {expandSteps && task.subtasks.length > 0 && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            onClick={(e) => e.stopPropagation()}
            className="overflow-hidden"
          >
            <div className="pt-1.5 pb-1 px-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-1.5">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 4: Spreadsheet-style Dropdown Condition + Quick Actions */}
      <div className="pt-2 border-t border-[#E2D9C8]/60 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <TaskConditionDropdown
            currentStatus={task.status}
            onSelectStatus={(nextStatus) => moveTaskStatus(task.id, nextStatus)}
            size="sm"
          />

          {canClutch85 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation()
                completeTaskVia85Rule(task.id)
              }}
              className="min-h-[28px] px-2 py-0.5 rounded-lg bg-[#1F7A4C] hover:bg-[#18633C] text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Progres sudah 85% — kumpulkan sekarang tanpa ragu (Aturan 85%)"
            >
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Selesai 85%</span>
            </motion.button>
          )}
        </div>

        {!isCompleted ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation()
              onStartFocusTimer(task)
            }}
            className="min-h-[28px] sm:min-h-[30px] px-2.5 sm:px-3 py-1 rounded-xl bg-[#D4532F] hover:bg-[#B84322] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Fokus</span>
          </motion.button>
        ) : (
          <span className="text-[11px] font-bold text-[#1F7A4C] flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Rampung</span>
          </span>
        )}
      </div>
    </motion.article>
  )
}
