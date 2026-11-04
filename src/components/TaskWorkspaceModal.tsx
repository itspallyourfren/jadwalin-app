// src/components/TaskWorkspaceModal.tsx - Add/Edit Task + Chunking, Pareto 80/20, Parkinson, WOOP, & Study Tools (SQ3R/Feynman/Blurting/Leitner)
import React, { useState } from 'react'
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Plus,
  Scissors,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { TASK_SCALES } from '../data/constants'
import { calcTaskProgress, isEligibleFor85Rule } from '../engine/boardFrameworksEngine'
import { useTrackerStore } from '../store/useTrackerStore'
import { SmartDecompositionModal } from './SmartDecompositionModal'
import { StudyWorkspacePanel } from './StudyWorkspacePanel'
import type {
  KanbanStatus,
  TaskCategory,
  TaskScale,
  TimeBlockTag,
  TrackerTask,
} from '../data/types'

type TaskWorkspaceModalProps = {
  taskId: string | null // null = mode Tambah Tugas Baru
  initialTab?: 'STEPS' | 'WOOP' | 'STUDY'
  onClose: () => void
  onStartFocusFromModal?: (task: TrackerTask) => void
}

const CATEGORIES: readonly TaskCategory[] = [
  'Kuliah & Tugas',
  'Belajar & Ujian',
  'Organisasi & Proyek',
  'Pribadi & Kebiasaan',
]

const TIME_BLOCKS: readonly TimeBlockTag[] = ['Pagi', 'Siang', 'Sore', 'Malam', 'Bebas']

export const TaskWorkspaceModal: React.FC<TaskWorkspaceModalProps> = ({
  taskId,
  initialTab = 'STEPS',
  onClose,
  onStartFocusFromModal,
}) => {
  const existingTask = useTrackerStore((s) =>
    taskId ? s.tasks.find((t) => t.id === taskId) ?? null : null
  )
  const addTask = useTrackerStore((s) => s.addTask)
  const updateTask = useTrackerStore((s) => s.updateTask)
  const deleteTask = useTrackerStore((s) => s.deleteTask)
  const autoChunkTask = useTrackerStore((s) => s.autoChunkTask)
  const applyAdaptivePlan = useTrackerStore((s) => s.applyAdaptivePlan)
  const addSubtask = useTrackerStore((s) => s.addSubtask)
  const toggleSubtask = useTrackerStore((s) => s.toggleSubtask)
  const toggleSubtaskPareto = useTrackerStore((s) => s.toggleSubtaskPareto)
  const deleteSubtask = useTrackerStore((s) => s.deleteSubtask)
  const completeTaskVia85Rule = useTrackerStore((s) => s.completeTaskVia85Rule)
  const updateWoopNote = useTrackerStore((s) => s.updateWoopNote)

  // State untuk form Tugas Baru
  const [title, setTitle] = useState(existingTask?.title ?? '')
  const [courseOrContext, setCourseOrContext] = useState(existingTask?.courseOrContext ?? '')
  const [category, setCategory] = useState<TaskCategory>(
    existingTask?.category ?? 'Kuliah & Tugas'
  )
  const [scale, setScale] = useState<TaskScale>(existingTask?.scale ?? 'Sedang')
  const [status, setStatus] = useState<KanbanStatus>(existingTask?.status ?? 'IN_PROGRESS')
  const [timeBlock, setTimeBlock] = useState<TimeBlockTag>(existingTask?.timeBlock ?? 'Pagi')
  const [deadlineLocal, setDeadlineLocal] = useState(
    existingTask?.deadlineIso ? existingTask.deadlineIso.slice(0, 16) : ''
  )
  const [internalDeadlineLocal, setInternalDeadlineLocal] = useState(
    existingTask?.internalDeadlineIso ? existingTask.internalDeadlineIso.slice(0, 16) : ''
  )
  const [isImportant, setIsImportant] = useState(existingTask?.isImportant ?? true)
  const [isEatThatFrog, setIsEatThatFrog] = useState(existingTask?.isEatThatFrog ?? false)
  const [autoChunkOnCreate, setAutoChunkOnCreate] = useState(true)

  // Tab saat membuka Tugas yang sudah ada
  const [activeTab, setActiveTab] = useState<'STEPS' | 'WOOP' | 'STUDY'>(initialTab)
  const [newSubtaskText, setNewSubtaskText] = useState('')
  const [newSubtaskPareto, setNewSubtaskPareto] = useState(false)
  const [showSmartAssistant, setShowSmartAssistant] = useState(false)

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({
      title,
      courseOrContext: courseOrContext || 'Umum',
      category,
      scale,
      status,
      timeBlock,
      deadlineIso: deadlineLocal ? new Date(deadlineLocal).toISOString() : null,
      internalDeadlineIso: internalDeadlineLocal
        ? new Date(internalDeadlineLocal).toISOString()
        : null,
      isImportant,
      isEatThatFrog,
      autoChunk: autoChunkOnCreate,
    })
    onClose()
  }

  const handleSaveBasicInfo = () => {
    if (!existingTask || !title.trim()) return
    updateTask(existingTask.id, {
      title: title.trim(),
      courseOrContext: courseOrContext.trim() || 'Umum',
      category,
      scale,
      status,
      timeBlock,
      deadlineIso: deadlineLocal ? new Date(deadlineLocal).toISOString() : null,
      internalDeadlineIso: internalDeadlineLocal
        ? new Date(internalDeadlineLocal).toISOString()
        : null,
      isImportant,
    })
  }

  // Mode 1: Tambah Tugas Baru
  if (!existingTask) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#FAF7F2] w-full max-w-lg rounded-3xl border border-[#C9B99F] shadow-xl overflow-hidden">
          <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#1E1915]">Tambah Target Tugas Baru</h2>
              <p className="text-xs text-[#5C5148] font-medium">
                Catat tugasmu dan pecah menjadi langkah kecil agar mudah dimulai.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="p-2 rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                Judul Tugas / Target *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Susun Bab 2 Tinjauan Pustaka / Laporan Praktikum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#C9B99F] text-sm font-semibold text-[#1E1915] focus:outline-2 focus:outline-[#2C4A3E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                  Mata Kuliah / Konteks
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Metodologi Riset"
                  value={courseOrContext}
                  onChange={(e) => setCourseOrContext(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] text-sm font-semibold text-[#1E1915]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                  Kategori Aktivitas
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] text-sm font-semibold text-[#1E1915]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skala Tugas */}
            <div>
              <label className="block text-xs font-extrabold text-[#1E1915] mb-1.5">
                Skala Tugas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TASK_SCALES.map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setScale(sc)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                      scale === sc
                        ? 'bg-[#2C4A3E] text-white border-[#2C4A3E]'
                        : 'bg-[#FFFDF9] text-[#5C5148] border-[#E2D9C8]'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            {/* Kolom Awal & Blok Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                  Taruh di Kolom Kanban
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as KanbanStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] text-sm font-semibold text-[#1E1915]"
                >
                  <option value="IN_PROGRESS">Fokus Hari Ini (Di Meja)</option>
                  <option value="BACKLOG">Laci Tugas (Simpan Dulu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                  Blok Waktu Terbaik (Time Blocking)
                </label>
                <select
                  value={timeBlock}
                  onChange={(e) => setTimeBlock(e.target.value as TimeBlockTag)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] text-sm font-semibold text-[#1E1915]"
                >
                  {TIME_BLOCKS.map((tb) => (
                    <option key={tb} value={tb}>
                      {tb}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tenggat Waktu Asli & Target Selesai Pribadi (Hukum Parkinson) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                  Tenggat Waktu (Deadline)
                </label>
                <input
                  type="datetime-local"
                  value={deadlineLocal}
                  onChange={(e) => setDeadlineLocal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] text-xs font-semibold text-[#1E1915]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                  Target Selesai Pribadi (Hukum Parkinson)
                </label>
                <input
                  type="datetime-local"
                  value={internalDeadlineLocal}
                  onChange={(e) => setInternalDeadlineLocal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E2D9C8] text-xs font-semibold text-[#1E1915]"
                />
              </div>
            </div>

            {/* Opsi Teknik Bawaan saat Buat Tugas */}
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-3.5 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoChunkOnCreate}
                  onChange={(e) => setAutoChunkOnCreate(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#2C4A3E]"
                />
                <div>
                  <span className="text-xs font-extrabold text-[#1E1915] block">
                    Otomatis Pecah Jadi Langkah Kecil (Task Chunking + Zeigarnik Starter)
                  </span>
                  <span className="text-xs text-[#5C5148]">
                    Membuat checklist langkah pembuka 2 menit dan penanda 20% bagian inti (Pareto).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#2C4A3E]"
                />
                <div>
                  <span className="text-xs font-extrabold text-[#1E1915] block">
                    Tugas Penting &amp; Berdampak Tinggi (Matriks Eisenhower)
                  </span>
                  <span className="text-xs text-[#5C5148]">
                    Masuk ke Kuadran 1 (Kerjakan Segera) atau Kuadran 2 (Jadwalkan).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEatThatFrog}
                  onChange={(e) => setIsEatThatFrog(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#D4532F]"
                />
                <div>
                  <span className="text-xs font-extrabold text-[#1E1915] block">
                    Jadikan Prioritas Pagi Terberat (Eat That Frog!)
                  </span>
                  <span className="text-xs text-[#5C5148]">
                    Sematkan di urutan paling atas Fokus Hari Ini agar diselesaikan paling awal.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#F2ECE1] text-xs font-bold text-[#5C5148] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#2C4A3E] hover:bg-[#21382F] text-white text-xs font-extrabold cursor-pointer"
              >
                Simpan Tugas ke Papan
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Mode 2: Ruang Kerja & Detail Tugas yang Sudah Ada
  const progress = calcTaskProgress(existingTask)
  const canClutch85 = isEligibleFor85Rule(existingTask)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#C9B99F] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#F2ECE1] text-[#2C4A3E]">
                {existingTask.scale}
              </span>
              <span className="text-xs font-bold text-[#5C5148]">
                {existingTask.courseOrContext} · {existingTask.category}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[#1E1915] mt-1 leading-snug">
              {existingTask.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onStartFocusFromModal && existingTask.status !== 'COMPLETED' && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onStartFocusFromModal(existingTask)
                }}
                className="px-3 py-2 rounded-xl bg-[#D4532F] text-white text-xs font-extrabold cursor-pointer"
              >
                Mulai Timer Fokus
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup rincian"
              className="p-2 rounded-xl bg-[#F2ECE1] text-[#5C5148] hover:text-[#1E1915] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Inside Task Workspace */}
        <div className="px-5 pt-3 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('STEPS')}
            className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'STEPS'
                ? 'border-[#2C4A3E] text-[#1E1915]'
                : 'border-transparent text-[#8C7E72] hover:text-[#1E1915]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Langkah Kecil &amp; Rincian ({existingTask.subtasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WOOP')}
            className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'WOOP'
                ? 'border-[#2C4A3E] text-[#1E1915]'
                : 'border-transparent text-[#8C7E72] hover:text-[#1E1915]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Antisipasi Hambatan (WOOP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STUDY')}
            className={`pb-2.5 px-3 text-xs font-extrabold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'STUDY'
                ? 'border-[#2C4A3E] text-[#1E1915]'
                : 'border-transparent text-[#8C7E72] hover:text-[#1E1915]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ruang Belajar (SQ3R · Feynman · Flashcard)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'STEPS' && (
            <>
              {/* Progress & 85% Rule Box */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-extrabold text-[#1E1915]">
                    Kemajuan Tugas: {progress}%
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowSmartAssistant(true)}
                      className="px-2.5 py-1 rounded-xl bg-[#E7F6EE] hover:bg-[#D1EEDE] text-[#1F7A4C] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Asisten Alur Cerdas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => autoChunkTask(existingTask.id)}
                      title="Reset langkah dasar"
                      className="p-1 rounded-lg text-[#8C7E72] hover:text-[#1E1915] cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="w-full h-2.5 rounded-full bg-[#F2ECE1] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progress >= 85 ? 'bg-[#1F7A4C]' : 'bg-[#2C4A3E]'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {existingTask.subtasks.length === 0 && (
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-[#5C5148] mb-1">
                      Atau geser persentase kemajuan manual:
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={existingTask.manualProgress}
                      onChange={(e) =>
                        updateTask(existingTask.id, { manualProgress: Number(e.target.value) })
                      }
                      className="w-full accent-[#2C4A3E]"
                    />
                  </div>
                )}

                {canClutch85 && (
                  <button
                    type="button"
                    onClick={() => {
                      completeTaskVia85Rule(existingTask.id)
                      onClose()
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1F7A4C] hover:bg-[#18633C] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sudah {progress}%! Tuntaskan Sekarang via The 85% Rule</span>
                  </button>
                )}
              </div>

              {/* Subtasks List (Task Chunking & Pareto 80/20) */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1E1915]">
                    Daftar Sub-Langkah (Task Chunking &amp; Pareto 80/20)
                  </h3>
                  <p className="text-xs text-[#5C5148]">
                    Klik ikon bintang untuk menandai <strong>20% langkah inti paling berdampak</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  {existingTask.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8]"
                    >
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => toggleSubtask(existingTask.id, sub.id)}
                        className="w-4 h-4 accent-[#2C4A3E] cursor-pointer shrink-0"
                      />
                      <span
                        className={`flex-1 text-xs font-semibold ${
                          sub.completed ? 'line-through text-[#8C7E72]' : 'text-[#1E1915]'
                        }`}
                      >
                        {sub.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSubtaskPareto(existingTask.id, sub.id)}
                        title="Tandai sebagai 20% Inti Berdampak (Prinsip Pareto)"
                        className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          sub.isParetoCore
                            ? 'bg-[#FEF3E2] text-[#B86B14] border border-[#B86B14]/30'
                            : 'text-[#8C7E72] hover:text-[#1E1915]'
                        }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${sub.isParetoCore ? 'fill-[#B86B14]' : ''}`}
                        />
                        <span>Inti 20%</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSubtask(existingTask.id, sub.id)}
                        aria-label="Hapus sub-langkah"
                        className="p-1 text-[#8C7E72] hover:text-[#C8432B] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Tambah sub-langkah kecil baru..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSubtask(existingTask.id, newSubtaskText, newSubtaskPareto)
                        setNewSubtaskText('')
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#C9B99F] text-xs font-semibold text-[#1E1915]"
                  />
                  <button
                    type="button"
                    onClick={() => setNewSubtaskPareto((v) => !v)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      newSubtaskPareto
                        ? 'bg-[#FEF3E2] text-[#B86B14] border-[#B86B14]'
                        : 'bg-[#FAF7F2] text-[#5C5148] border-[#E2D9C8]'
                    }`}
                  >
                    ★ Inti
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addSubtask(existingTask.id, newSubtaskText, newSubtaskPareto)
                      setNewSubtaskText('')
                    }}
                    className="px-3 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Edit Basic Task Metadata & Parkinson Internal Deadline */}
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-[#1E1915]">
                  Pengaturan Tugas &amp; Hukum Parkinson
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5C5148] mb-1">
                      Judul Tugas
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleSaveBasicInfo}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold text-[#1E1915]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5148] mb-1">
                      Mata Kuliah / Konteks
                    </label>
                    <input
                      type="text"
                      value={courseOrContext}
                      onChange={(e) => setCourseOrContext(e.target.value)}
                      onBlur={handleSaveBasicInfo}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold text-[#1E1915]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5148] mb-1">
                      Tenggat Resmi
                    </label>
                    <input
                      type="datetime-local"
                      value={deadlineLocal}
                      onChange={(e) => {
                        setDeadlineLocal(e.target.value)
                        updateTask(existingTask.id, {
                          deadlineIso: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        })
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold text-[#1E1915]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5148] mb-1">
                      Target Selesai Pribadi (Hukum Parkinson)
                    </label>
                    <input
                      type="datetime-local"
                      value={internalDeadlineLocal}
                      onChange={(e) => {
                        setInternalDeadlineLocal(e.target.value)
                        updateTask(existingTask.id, {
                          internalDeadlineIso: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        })
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold text-[#1E1915]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'WOOP' && (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#1E1915]">
                  WOOP Framework &amp; Premortem Analysis
                </h3>
                <p className="text-xs text-[#5C5148]">
                  Kenali potensi rintangan internal maupun eksternal sebelum terjadi, lalu siapkan langkah antisipasi <strong>Jika–Maka</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                    Wish (Target Spesifik yang Ingin Dicapai):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Menyelesaikan draf laporan sebelum Jumat sore"
                    value={existingTask.woop.wish}
                    onChange={(e) =>
                      updateWoopNote(existingTask.id, {
                        ...existingTask.woop,
                        wish: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#1E1915] mb-1">
                    Outcome (Hasil Terbaik yang Kamu Rasakan Saat Beres):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Akhir pekan bisa istirahat tenang tanpa beban"
                    value={existingTask.woop.outcome}
                    onChange={(e) =>
                      updateWoopNote(existingTask.id, {
                        ...existingTask.woop,
                        outcome: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#C8432B] mb-1">
                    Obstacle / Premortem (Hambatan Terbesar yang Sering Membuatmu Menunda):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Bingung mulai dari mana atau terdistraksi scroll HP saat mentok"
                    value={existingTask.woop.obstacle}
                    onChange={(e) =>
                      updateWoopNote(existingTask.id, {
                        ...existingTask.woop,
                        obstacle: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#1F7A4C] mb-1">
                    Plan Jika–Maka (Solusi Otomatis Saat Hambatan Muncul):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: JIKA aku mulai bingung dan ingin buka medsos, MAKA aku akan nyalakan 10-Minute Rule dan tulis 1 paragraf kasar saja."
                    value={existingTask.woop.ifThenPlan}
                    onChange={(e) =>
                      updateWoopNote(existingTask.id, {
                        ...existingTask.woop,
                        ifThenPlan: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'STUDY' && <StudyWorkspacePanel task={existingTask} />}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#FFFDF9] border-t border-[#E2D9C8] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              deleteTask(existingTask.id)
              onClose()
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold text-[#C8432B] hover:bg-[#FDECE8] flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Tugas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSaveBasicInfo()
              onClose()
            }}
            className="px-5 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesai &amp; Tutup</span>
          </button>
        </div>
      </div>

      {showSmartAssistant && existingTask && (
        <SmartDecompositionModal
          task={existingTask}
          onClose={() => setShowSmartAssistant(false)}
          onApplySteps={(steps) => applyAdaptivePlan(existingTask.id, steps)}
        />
      )}
    </div>
  )
}
