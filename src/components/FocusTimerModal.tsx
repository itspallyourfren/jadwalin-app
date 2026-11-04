// src/components/FocusTimerModal.tsx - Dynamic Multi-Phase Focus & Break Cycle Timer
import React, { useEffect, useState } from 'react'
import {
  Check,
  Coffee,
  Flame,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Shuffle,
  Timer,
  X,
  Zap,
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

type SessionPhase = 'FOCUS' | 'BREAK'

const TIMER_MODES: Array<{
  mode: TimerMode
  label: string
  shortDesc: string
  defaultMinutes: number
  isPomodoro: boolean
}> = [
  {
    mode: 'TEN_MINUTE_RULE',
    label: 'Mulai 10m',
    shortDesc: 'Hitung 5-4-3-2-1 lalu cicil 10 menit saja.',
    defaultMinutes: 10,
    isPomodoro: false,
  },
  {
    mode: 'POMODORO_25_5',
    label: 'Pomodoro',
    shortDesc: 'Siklus fokus penuh diselingi waktu rehat.',
    defaultMinutes: 25,
    isPomodoro: true,
  },
  {
    mode: 'FLOW_SPRINT_45',
    label: 'Flow 45m',
    shortDesc: 'Sesi kerja mendalam tanpa interupsi.',
    defaultMinutes: 45,
    isPomodoro: false,
  },
  {
    mode: 'QUICK_REST_5',
    label: 'Rehat 5m',
    shortDesc: 'Minum air & regangkan badan sejenak.',
    defaultMinutes: 5,
    isPomodoro: false,
  },
]

const POMODORO_PRESETS = [
  { label: '15m / 3m', focusMin: 15, breakMin: 3, tag: 'Ringan' },
  { label: '25m / 5m', focusMin: 25, breakMin: 5, tag: 'Standar' },
  { label: '50m / 10m', focusMin: 50, breakMin: 10, tag: 'Mendalam' },
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
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>(
    initialMode === 'QUICK_REST_5' ? 'BREAK' : 'FOCUS'
  )

  const [focusMinutes, setFocusMinutes] = useState<number>(25)
  const [breakMinutes, setBreakMinutes] = useState<number>(5)

  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    initialMode === 'QUICK_REST_5' ? 5 * 60 : getTimerDurationSeconds(initialMode)
  )
  const [isRunning, setIsRunning] = useState(false)
  const [fiveSecCountdown, setFiveSecCountdown] = useState<number | null>(null)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [cycleCompletedCount, setCycleCompletedCount] = useState(0)

  const [ulyssesChecked, setUlyssesChecked] = useState(false)
  const [bundlingChecked, setBundlingChecked] = useState(false)

  const currentModeConfig =
    TIMER_MODES.find((m) => m.mode === mode) ?? TIMER_MODES[0]

  const switchMode = (nextMode: TimerMode) => {
    setIsRunning(false)
    setFiveSecCountdown(null)
    setSessionCompleted(false)
    setMode(nextMode)

    if (nextMode === 'QUICK_REST_5') {
      setSessionPhase('BREAK')
      setSecondsLeft(5 * 60)
    } else if (nextMode === 'POMODORO_25_5') {
      setSessionPhase('FOCUS')
      setSecondsLeft(focusMinutes * 60)
    } else {
      setSessionPhase('FOCUS')
      setSecondsLeft(getTimerDurationSeconds(nextMode))
    }
  }

  const applyPomodoroPreset = (fMin: number, bMin: number) => {
    setFocusMinutes(fMin)
    setBreakMinutes(bMin)
    setIsRunning(false)
    setSessionPhase('FOCUS')
    setSecondsLeft(fMin * 60)
    setSessionCompleted(false)
  }

  const adjustMinutes = (delta: number) => {
    if (isRunning) return
    if (sessionPhase === 'FOCUS') {
      const next = Math.max(1, Math.min(120, focusMinutes + delta))
      setFocusMinutes(next)
      setSecondsLeft(next * 60)
    } else {
      const next = Math.max(1, Math.min(60, breakMinutes + delta))
      setBreakMinutes(next)
      setSecondsLeft(next * 60)
    }
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

      if (sessionPhase === 'FOCUS') {
        // Selesai Sesi Fokus
        const loggedMins = mode === 'POMODORO_25_5' ? focusMinutes : currentModeConfig.defaultMinutes
        if (loggedMins > 0) {
          logFocusSession(selectedTaskId, loggedMins, mode === 'POMODORO_25_5')
        }
        setCycleCompletedCount((c) => c + 1)

        if (mode === 'POMODORO_25_5') {
          // Otomatis transisi ke fase Rehat
          setSessionPhase('BREAK')
          setSecondsLeft(breakMinutes * 60)
          triggerSampleNotification(
            'Sesi Fokus Selesai! Waktunya Rehat ☕',
            `Kerja bagus! Ambil jeda ${breakMinutes} menit untuk minum air dan relaksasi.`
          )
        } else {
          setSessionCompleted(true)
          triggerSampleNotification(
            `Sesi ${currentModeConfig.label} selesai`,
            currentTask ? `"${currentTask.title}" bertambah maju.` : 'Waktunya rehat sejenak.',
            selectedTaskId ?? undefined
          )
        }
      } else {
        // Selesai Sesi Rehat
        setSessionPhase('FOCUS')
        setSecondsLeft(focusMinutes * 60)
        triggerSampleNotification(
          'Waktu Rehat Selesai 🚀',
          'Pikiran sudah segar kembali? Mulai sesi fokus berikutnya saat siap!'
        )
      }
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [
    isRunning,
    secondsLeft,
    sessionPhase,
    mode,
    focusMinutes,
    breakMinutes,
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
    const minutesToLog = Math.max(
      1,
      Math.round(
        (mode === 'POMODORO_25_5' ? focusMinutes * 60 - secondsLeft : currentModeConfig.defaultMinutes * 60 - secondsLeft) / 60
      )
    )
    logFocusSession(selectedTaskId, minutesToLog, mode === 'POMODORO_25_5')
    setSessionCompleted(true)
    triggerSampleNotification(
      'Sesi Tersimpan',
      `Fokus ${minutesToLog} menit telah ditambahkan ke progres tugas.`,
      selectedTaskId ?? undefined
    )
  }

  const handleSwitchToProductiveTask = () => {
    if (!currentTask) return
    const recommended = recommendProductiveSwitchTask(currentTask, tasks)
    if (recommended) {
      setSelectedTaskId(recommended.id)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[#C9B99F] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center shrink-0">
              {sessionPhase === 'BREAK' ? (
                <Coffee className="w-5 h-5 text-[#1F7A4C]" />
              ) : mode === 'TEN_MINUTE_RULE' ? (
                <Zap className="w-5 h-5 text-[#D4532F]" />
              ) : mode === 'POMODORO_25_5' ? (
                <Timer className="w-5 h-5 text-[#2C4A3E]" />
              ) : (
                <Flame className="w-5 h-5 text-[#B86B14]" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1E1915]">
                {sessionPhase === 'BREAK'
                  ? 'Fase Rehat Sejenak ☕'
                  : `Timer Fokus: ${currentModeConfig.label}`}
              </h2>
              <p className="text-xs text-[#5C5148]">
                {sessionPhase === 'BREAK'
                  ? 'Istirahat santai sebelum melanjutkan fokus berikutnya.'
                  : currentModeConfig.shortDesc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup timer"
            className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
          >
            <X className="w-5 h-5" />
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

          {/* Pomodoro Presets & Duration Adjuster */}
          {mode === 'POMODORO_25_5' && (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1E1915]">Pilihan Ritme Pomodoro:</span>
                <span className="text-[11px] text-[#5C5148] font-bold">
                  Siklus ke-{cycleCompletedCount + 1}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {POMODORO_PRESETS.map((p) => {
                  const isActive = focusMinutes === p.focusMin && breakMinutes === p.breakMin
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPomodoroPreset(p.focusMin, p.breakMin)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2C4A3E] text-white border-[#2C4A3E] shadow-2xs'
                          : 'bg-[#FAF7F2] text-[#1E1915] border-[#E2D9C8] hover:border-[#C9B99F]'
                      }`}
                    >
                      <div className="text-xs font-black">{p.label}</div>
                      <div className={`text-[10px] font-semibold ${isActive ? 'text-[#FAF7F2]/80' : 'text-[#8C7E72]'}`}>
                        {p.tag}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Target Task Picker */}
          {sessionPhase === 'FOCUS' && (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3 space-y-2">
              <select
                value={selectedTaskId ?? ''}
                onChange={(e) => setSelectedTaskId(e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-bold text-[#1E1915] focus:outline-2 focus:outline-[#2C4A3E]"
              >
                <option value="">-- Fokus Umum Tanpa Tugas Tertentu --</option>
                {activeTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.courseOrContext ? `[${t.courseOrContext}] ` : ''}
                    {t.title}
                  </option>
                ))}
              </select>

              {currentTask && currentTask.subtasks.length > 0 && (
                <div className="pt-2 border-t border-[#E2D9C8]/60 space-y-1.5 max-h-36 overflow-y-auto">
                  <span className="text-xs font-bold text-[#5C5148]">Sub-langkah aktif:</span>
                  {currentTask.subtasks.map((sub) => (
                    <label
                      key={sub.id}
                      className="flex items-center gap-2 text-xs text-[#1E1915] cursor-pointer"
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

          {/* Clock Display & Controls */}
          <div
            className={`rounded-2xl border py-6 px-4 text-center space-y-4 transition-colors ${
              sessionPhase === 'BREAK'
                ? 'bg-[#F2FBF6] border-[#BDE8D0]'
                : 'bg-[#FFFDF9] border-[#E2D9C8]'
            }`}
          >
            {/* Phase Indicator Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              {sessionPhase === 'BREAK' ? (
                <span className="bg-[#1F7A4C] text-white px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Waktu Rehat ({breakMinutes}m)</span>
                </span>
              ) : (
                <span className="bg-[#2C4A3E] text-white px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fase Fokus Belajar</span>
                </span>
              )}
            </div>

            {fiveSecCountdown !== null ? (
              <div className="py-2 space-y-1">
                <span className="text-xs font-bold text-[#D4532F]">Siap Fokus</span>
                <div className="text-5xl font-black text-[#1E1915] tabular-nums">
                  {fiveSecCountdown}
                </div>
                <p className="text-xs text-[#5C5148]">Mulai begitu hitungan selesai...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3">
                  {!isRunning && (
                    <button
                      type="button"
                      onClick={() => adjustMinutes(-5)}
                      title="Kurangi 5 menit"
                      className="w-8 h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E2D9C8] flex items-center justify-center text-[#5C5148] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}

                  <div className="text-5xl sm:text-6xl font-black text-[#1E1915] tracking-tight tabular-nums">
                    {formatSecondsMmSs(secondsLeft)}
                  </div>

                  {!isRunning && (
                    <button
                      type="button"
                      onClick={() => adjustMinutes(5)}
                      title="Tambah 5 menit"
                      className="w-8 h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E2D9C8] flex items-center justify-center text-[#5C5148] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {!isRunning ? (
                    <button
                      type="button"
                      onClick={handleStartClick}
                      className={`min-h-[44px] px-6 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                        sessionPhase === 'BREAK'
                          ? 'bg-[#1F7A4C] hover:bg-[#18633C]'
                          : 'bg-[#D4532F] hover:bg-[#B84322]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{sessionPhase === 'BREAK' ? 'Mulai Rehat' : 'Mulai Fokus'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRunning(false)}
                      className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#1E1915] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsRunning(false)
                      if (sessionPhase === 'BREAK') {
                        setSecondsLeft(breakMinutes * 60)
                      } else {
                        setSecondsLeft(mode === 'POMODORO_25_5' ? focusMinutes * 60 : getTimerDurationSeconds(mode))
                      }
                      setSessionCompleted(false)
                    }}
                    aria-label="Reset timer"
                    title="Ulangi waktu sesi ini"
                    className="w-10 h-10 rounded-xl bg-[#F2ECE1] hover:bg-[#E2D9C8] text-[#1E1915] flex items-center justify-center cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {sessionPhase === 'FOCUS' && !sessionCompleted && (
                    <button
                      type="button"
                      onClick={handleCompleteEarlyAndLog}
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#E7F6EE] hover:bg-[#D1EEDE] text-[#1F7A4C] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Sesi</span>
                    </button>
                  )}

                  {sessionPhase === 'BREAK' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsRunning(false)
                        setSessionPhase('FOCUS')
                        setSecondsLeft(focusMinutes * 60)
                      }}
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] text-[#1E1915] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lewati ke Fokus</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {sessionCompleted && (
              <div className="pt-2 border-t border-[#E2D9C8] flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#1F7A4C]">Sesi fokus tercatat!</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSessionPhase('BREAK')
                      setSecondsLeft(breakMinutes * 60)
                      setSessionCompleted(false)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#1F7A4C] text-white font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Coffee className="w-3 h-3" />
                    <span>Mulai Rehat {breakMinutes}m</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Behavioral Hacks Checklist */}
          {sessionPhase === 'FOCUS' && (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-2 text-xs">
              <span className="font-extrabold text-[#1E1915] block">
                Persiapan Bebas Distraksi:
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ulyssesChecked}
                  onChange={(e) => setUlyssesChecked(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#2C4A3E]"
                />
                <span className="text-[#5C5148]">
                  <strong>Ulysses Pact:</strong> HP dalam mode hening / layar dibalik.
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bundlingChecked}
                  onChange={(e) => setBundlingChecked(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#2C4A3E]"
                />
                <span className="text-[#5C5148]">
                  <strong>Temptation Bundling:</strong> Sudah menyiapkan air minum/playlist fokus.
                </span>
              </label>

              {currentTask && (
                <div className="pt-2 border-t border-[#E2D9C8]/60 flex items-center justify-between">
                  <span className="text-[#8C7E72]">Merasa buntu di tugas ini?</span>
                  <button
                    type="button"
                    onClick={handleSwitchToProductiveTask}
                    className="text-[#2C4A3E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Ganti Selingan Produktif</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
