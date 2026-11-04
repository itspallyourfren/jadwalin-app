// src/components/StudyWorkspacePanel.tsx - Study & Active Recall Workspace (SQ3R, Feynman, Blurting, Leitner)
import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTrackerStore } from '../store/useTrackerStore'
import type { TrackerTask } from '../data/types'

type StudyWorkspacePanelProps = {
  task: TrackerTask
}

export const StudyWorkspacePanel: React.FC<StudyWorkspacePanelProps> = ({ task }) => {
  const updateStudyNotes = useTrackerStore((s) => s.updateStudyNotes)

  const [fcQuestion, setFcQuestion] = useState('')
  const [fcAnswer, setFcAnswer] = useState('')
  const [revealedFlashcardIds, setRevealedFlashcardIds] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-4">
      {/* 1. Membaca Efektif (SQ3R) */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-2.5">
        <h3 className="text-sm font-extrabold text-[#1E1915]">
          1. Membaca Efektif (Pindai, Tanya, Pahami)
        </h3>
        <div className="flex items-center gap-3 flex-wrap text-xs font-bold text-[#1E1915]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={task.studyNotes.sq3r.survey}
              onChange={(e) =>
                updateStudyNotes(task.id, {
                  ...task.studyNotes,
                  sq3r: { ...task.studyNotes.sq3r, survey: e.target.checked },
                })
              }
              className="w-4 h-4 accent-[#2C4A3E]"
            />
            <span>Pindai Daftar Isi / Subjudul</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={task.studyNotes.sq3r.read}
              onChange={(e) =>
                updateStudyNotes(task.id, {
                  ...task.studyNotes,
                  sq3r: { ...task.studyNotes.sq3r, read: e.target.checked },
                })
              }
              className="w-4 h-4 accent-[#2C4A3E]"
            />
            <span>Baca Cari Jawaban</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={task.studyNotes.sq3r.review}
              onChange={(e) =>
                updateStudyNotes(task.id, {
                  ...task.studyNotes,
                  sq3r: { ...task.studyNotes.sq3r, review: e.target.checked },
                })
              }
              className="w-4 h-4 accent-[#2C4A3E]"
            />
            <span>Tinjau Ulang Inti Bab</span>
          </label>
        </div>

        <input
          type="text"
          placeholder="Pertanyaan utama apa yang ingin kamu temukan jawabannya dari materi ini?"
          value={task.studyNotes.sq3r.question}
          onChange={(e) =>
            updateStudyNotes(task.id, {
              ...task.studyNotes,
              sq3r: { ...task.studyNotes.sq3r, question: e.target.value },
            })
          }
          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold"
        />
      </div>

      {/* 2. Jelaskan dengan Bahasa Sederhana */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-2">
        <h3 className="text-sm font-extrabold text-[#1E1915]">
          2. Jelaskan dengan Bahasa Sendiri (Metode Feynman)
        </h3>
        <p className="text-xs text-[#5C5148]">
          Tuliskan inti konsep ini seolah kamu sedang menerangkannya ke teman awam tanpa istilah rumit:
        </p>
        <textarea
          rows={3}
          placeholder="Konsep ini secara sederhana bekerja seperti..."
          value={task.studyNotes.feynmanExplanation}
          onChange={(e) =>
            updateStudyNotes(task.id, {
              ...task.studyNotes,
              feynmanExplanation: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold"
        />
      </div>

      {/* 3. Tulis Ingatan Bebas */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-2">
        <h3 className="text-sm font-extrabold text-[#1E1915]">
          3. Tulis Ingatan Bebas (Blurting)
        </h3>
        <textarea
          rows={2}
          placeholder="Tutup buku atau slide, lalu ketik semua kata kunci dan alur yang masih kamu ingat di sini..."
          value={task.studyNotes.blurtingDump}
          onChange={(e) =>
            updateStudyNotes(task.id, {
              ...task.studyNotes,
              blurtingDump: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold"
        />
      </div>

      {/* 4. Flashcard Tanya-Jawab */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9C8] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#1E1915]">
              4. Kartu Tanya-Jawab (Flashcard)
            </h3>
            <p className="text-xs text-[#5C5148]">
              Uji ingatanmu sebelum membuka jawaban. Simpan ke Kotak 3 (K3) saat materi sudah kamu kuasai.
            </p>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#2C4A3E]">
            {task.studyNotes.flashcards.length} kartu
          </span>
        </div>

        <div className="space-y-2">
          {task.studyNotes.flashcards.length === 0 ? (
            <p className="text-xs text-[#8C7E72] py-2 text-center italic">
              Belum ada flashcard untuk materi ini. Buat pertanyaan pertamamu di bawah.
            </p>
          ) : (
            task.studyNotes.flashcards.map((fc) => {
              const isRevealed = Boolean(revealedFlashcardIds[fc.id])
              return (
                <div
                  key={fc.id}
                  className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-start justify-between gap-2.5"
                >
                  <div className="space-y-1 text-xs flex-1 min-w-0">
                    <p className="font-extrabold text-[#1E1915]">T: {fc.question}</p>
                    {isRevealed ? (
                      <div className="flex items-center justify-between gap-2 bg-[#E7F6EE] px-2.5 py-1.5 rounded-lg border border-[#1F7A4C]/20">
                        <p className="font-semibold text-[#1F7A4C]">J: {fc.answer}</p>
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedFlashcardIds((prev) => ({ ...prev, [fc.id]: false }))
                          }
                          className="text-xs text-[#8C7E72] hover:text-[#1E1915] underline cursor-pointer shrink-0"
                        >
                          Sembunyikan
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedFlashcardIds((prev) => ({ ...prev, [fc.id]: true }))
                        }
                        className="text-xs font-bold text-[#2C4A3E] hover:underline cursor-pointer"
                      >
                        👁️ Tampilkan Jawaban
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-0.5">
                      {([1, 2, 3] as const).map((boxNum) => (
                        <button
                          key={boxNum}
                          type="button"
                          onClick={() =>
                            updateStudyNotes(task.id, {
                              ...task.studyNotes,
                              flashcards: task.studyNotes.flashcards.map((item) =>
                                item.id === fc.id ? { ...item, box: boxNum } : item
                              ),
                            })
                          }
                          title={`Pindahkan ke Kotak ${boxNum}`}
                          className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            fc.box === boxNum
                              ? 'bg-[#2C4A3E] text-white'
                              : 'bg-[#FFFDF9] border border-[#E2D9C8] text-[#5C5148]'
                          }`}
                        >
                          K{boxNum}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateStudyNotes(task.id, {
                          ...task.studyNotes,
                          flashcards: task.studyNotes.flashcards.filter(
                            (item) => item.id !== fc.id
                          ),
                        })
                      }
                      aria-label="Hapus flashcard"
                      className="p-1 text-[#8C7E72] hover:text-[#C8432B] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <input
            type="text"
            placeholder="Pertanyaan uji ingatan..."
            value={fcQuestion}
            onChange={(e) => setFcQuestion(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold text-[#1E1915]"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Jawaban singkat..."
              value={fcAnswer}
              onChange={(e) => setFcAnswer(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-semibold text-[#1E1915]"
            />
            <button
              type="button"
              onClick={() => {
                if (!fcQuestion.trim() || !fcAnswer.trim()) return
                updateStudyNotes(task.id, {
                  ...task.studyNotes,
                  flashcards: [
                    ...task.studyNotes.flashcards,
                    {
                      id: `fc-${Date.now()}`,
                      question: fcQuestion.trim(),
                      answer: fcAnswer.trim(),
                      box: 1,
                    },
                  ],
                })
                setFcQuestion('')
                setFcAnswer('')
              }}
              className="px-3 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-bold cursor-pointer shrink-0"
            >
              + Flashcard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
