// src/components/FocusTimerModal.tsx - Clean, Minimal Focus Timer
import React, { useEffect, useState } from 'react'
import {
  Check,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  X,
} from 'lucide-react'
import {
  formatSecondsMmSs,
  getTimerDurationSeconds,
  recommendProductiveSwitchTask,
} from '../engine/studyAndTimerEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import type { TimerMode, TrackerTask } from '../data/types'

type FocusTimerModalProps = {
  initialTask: TrackerTask | null
  initialMode?: TimerMode
  onClose: () => void
}

const TIMER_MODES: Array<{
  mode: TimerMode
  label: string
  shortDesc: string
  cardAsset: string
  minutesLogged: number
  isPomodoro: boolean
}> = [
  {
    mode: 'TEN_MINUTE_RULE',
    label: 'Mulai 10m',
    shortDesc: 'Hitung 5-4-3-2-1 lalu cicil 10 menit saja.',
    cardAsset: '/assets/cards/tek_08_10_minute.webp',
    minutesLogged: 10,
    isPomodoro: false,
  },
  {
    mode: 'POMODORO_25_5',
    label: 'Pomodoro 25m',
    shortDesc: '25 menit fokus penuh + 5 menit rehat.',
    cardAsset: '/assets/cards/tek_01_pomodoro.webp',
    minutesLogged: 25,
    isPomodoro: true,
  },
  {
    mode: 'FLOW_SPRINT_45',
    label: 'Flow 45m',
    shortDesc: 'Sesi kerja mendalam tanpa interupsi.',
    cardAsset: '/assets/cards/tek_29_flow_state_sprint.webp',
    minutesLogged: 45,
    isPomodoro: false,
  },
  {
    mode: 'QUICK_REST_5',
    label: 'Rehat 5m',
    shortDesc: 'Minum air & regangkan badan sejenak.',
    cardAsset: '/assets/cards/tek_33_biological_prime_time.webp',
    minutesLogged: 0,
    isPomodoro: false,
  },
]

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  initialTask,
  initialMode = 'TEN_MINUTE_RULE',
  onClose,
}) => {
  const tasks = useTrackerStore((s) => s.tasks)
  const logFocusSession = useTrackerStore((s) => s.logFocusSession)
  const toggleSubtask = useTrackerStore((s) => s.toggleSubtask)
  const triggerSampleNotification = useTrackerStore((s) => s.triggerSampleNotification)

  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialTask?.id ?? activeTasks[0]?.id ?? null
  )
  const currentTask = tasks.find((t) => t.id === selectedTaskId) ?? null

  const [mode, setMode] = useState<TimerMode>(initialMode)
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    getTimerDurationSeconds(initialMode)
  )
  const [isRunning, setIsRunning] = useState(false)
  const [fiveSecCountdown, setFiveSecCountdown] = useState<number | null>(null)
  const [sessionCompleted, setSessionCompleted] = useState(false)

  const [ulyssesChecked, setUlyssesChecked] = useState(false)
  const [bundlingChecked, setBundlingChecked] = useState(false)

  const currentModeConfig =
    TIMER_MODES.find((m) => m.mode === mode) ?? TIMER_MODES[0]

  const switchMode = (nextMode: TimerMode) => {
    setIsRunning(false)
    setFiveSecCountdown(null)
    setSessionCompleted(false)
    setMode(nextMode)
    setSecondsLeft(getTimerDurationSeconds(nextMode))
  }

  useEffect(() => {
    if (fiveSecCountdown === null) return
    if (fiveSecCountdown <= 1) {
      const t = setTimeout(() => {
        setFiveSecCountdown(null)
        setIsRunning(true)
      }, 800)
      return () => clearTimeout(t)
    }
    const timer = setTimeout(() => {
      setFiveSecCountdown((prev) => (prev !== null ? prev - 1 : null))
    }, 800)
    return () => clearTimeout(timer)
  }, [fiveSecCountdown])

  useEffect(() => {
    if (!isRunning) return
    if (secondsLeft <= 1) {
      setIsRunning(false)
      setSecondsLeft(0)
      setSessionCompleted(true)
      if (currentModeConfig.minutesLogged > 0) {
        logFocusSession(
          selectedTaskId,
          currentModeConfig.minutesLogged,
          currentModeConfig.isPomodoro
        )
      }
      triggerSampleNotification(
        `Sesi ${currentModeConfig.label} selesai`,
        currentTask ? `"${currentTask.title}" bertambah maju.` : 'Waktunya rehat sejenak.',
        selectedTaskId ?? undefined
      )
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [
    isRunning,
    secondsLeft,
    currentModeConfig,
    selectedTaskId,
    currentTask,
    logFocusSession,
    triggerSampleNotification,
  ])

  const handleStartClick = () => {
    if (
      mode === 'TEN_MINUTE_RULE' &&
      secondsLeft === getTimerDurationSeconds('TEN_MINUTE_RULE') &&
      !isRunning
    ) {
      setFiveSecCountdown(5)
    } else {
      setIsRunning(true)
    }
  }

  const handleCompleteEarlyAndLog = () => {
    setIsRunning(false)
    setSessionCompleted(true)
    const elapsedMinutes = Math.max(
      5,
      Math.round((getTimerDurationSeconds(mode) - secondsLeft) / 60) ||
        currentModeConfig.minutesLogged
    )
    if (currentModeConfig.minutesLogged > 0) {
      logFocusSession(selectedTaskId, elapsedMinutes, currentModeConfig.isPomodoro)
    }
    triggerSampleNotification(
      'Sesi fokus tercatat',
      `+${elapsedMinutes} menit ditambahkan ke progres tugasmu.`,
      selectedTaskId ?? undefined
    )
  }

  const alternativeTask = currentTask
    ? recommendProductiveSwitchTask(currentTask, tasks)
    : null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-3xl border border-[#C9B99F] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Compact Header */}
        <div className="px-4 py-3.5 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentModeConfig.cardAsset}
              alt={currentModeConfig.label}
              className="w-7 h-9 object-cover rounded border border-[#C9B99F]"
            />
            <div>
              <h2 className="text-sm font-bold text-[#1E1915]">Timer Fokus</h2>
              <p className="text-xs text-[#5C5148]">{currentModeConfig.shortDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup timer"
            className="p-1.5 rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3.5">
          {/* Mode Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-[#F2ECE1] p-1 rounded-xl border border-[#E2D9C8]">
            {TIMER_MODES.map((m) => (
              <button
                key={m.mode}
                type="button"
                onClick={() => switchMode(m.mode)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  mode === m.mode
                    ? 'bg-[#FFFDF9] text-[#1E1915] shadow-2xs'
                    : 'text-[#5C5148] hover:text-[#1E1915]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Target Task Picker */}
          {mode !== 'QUICK_REST_5' && (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3 space-y-2">
              <select
                value={selectedTaskId ?? ''}
                onChange={(e) => setSelectedTaskId(e.target.value || null)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-bold text-[#1E1915]"
              >
                {activeTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.scale})
                  </option>
                ))}
              </select>

              {currentTask && currentTask.subtasks.length > 0 && (
                <div className="space-y-1 pt-1">
                  {currentTask.subtasks.slice(0, 3).map((sub) => (
                    <label
                      key={sub.id}
                      className="flex items-center gap-2 text-xs text-[#1E1915] cursor-pointer py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => toggleSubtask(currentTask.id, sub.id)}
                        className="w-3.5 h-3.5 accent-[#2C4A3E]"
                      />
                      <span className={sub.completed ? 'line-through text-[#8C7E72]' : 'font-medium'}>
                        {sub.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clock */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] py-6 px-4 text-center space-y-4">
            {fiveSecCountdown !== null ? (
              <div className="py-2 space-y-1">
                <span className="text-xs font-bold text-[#D4532F]">5-Second Rule</span>
                <div className="text-5xl font-black text-[#1E1915] tabular-nums">
                  {fiveSecCountdown}
                </div>
                <p className="text-xs text-[#5C5148]">Siap mulai saat angka habis...</p>
              </div>
            ) : (
              <>
                <div className="text-5xl sm:text-6xl font-black text-[#1E1915] tracking-tight tabular-nums">
                  {formatSecondsMmSs(secondsLeft)}
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {!isRunning ? (
                    <button
                      type="button"
                      onClick={handleStartClick}
                      className="min-h-[42px] px-5 py-2 rounded-xl bg-[#D4532F] hover:bg-[#B84322] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Mulai</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRunning(false)}
                      className="min-h-[42px] px-5 py-2 rounded-xl bg-[#1E1915] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsRunning(false)
                      setSecondsLeft(getTimerDurationSeconds(mode))
                      setSessionCompleted(false)
                    }}
                    aria-label="Reset timer"
                    className="min-h-[42px] px-3 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {mode !== 'QUICK_REST_5' && !sessionCompleted && (
                    <button
                      type="button"
                      onClick={handleCompleteEarlyAndLog}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#E7F6EE] text-[#1F7A4C] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Sesi</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {sessionCompleted && (
              <div className="pt-2 border-t border-[#E2D9C8] flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#1F7A4C]">Sesi tercatat!</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => switchMode('POMODORO_25_5')}
                    className="px-2.5 py-1 rounded-lg bg-[#2C4A3E] text-white font-semibold cursor-pointer"
                  >
                    Lanjut 25m
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('QUICK_REST_5')}
                    className="px-2.5 py-1 rounded-lg bg-[#F2ECE1] text-[#1E1915] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Coffee className="w-3 h-3" />
                    <span>Rehat 5m</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Compact Pre-Flight Checkboxes */}
          <div className="flex items-center justify-between gap-3 px-1 text-xs text-[#5C5148]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={ulyssesChecked}
                onChange={(e) => setUlyssesChecked(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#2C4A3E]"
              />
              <span>Jauhkan HP (Ulysses Pact)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={bundlingChecked}
                onChange={(e) => setBundlingChecked(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#2C4A3E]"
              />
              <span>Kopi / Playlist siap</span>
            </label>
          </div>

          {/* Switch Task if Stuck */}
          {alternativeTask && (
            <div className="bg-[#F2ECE1]/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
              <span className="text-[#5C5148] truncate">
                Mentok? Coba selingi: <strong className="text-[#1E1915]">{alternativeTask.title}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTaskId(alternativeTask.id)}
                className="px-2.5 py-1 rounded-lg bg-[#FFFDF9] border border-[#E2D9C8] font-bold text-[#1E1915] flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Shuffle className="w-3 h-3" />
                <span>Ganti</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
