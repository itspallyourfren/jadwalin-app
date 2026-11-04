// src/components/KeyboardShortcutsHelpModal.tsx - Desktop Keyboard Shortcuts Cheat Sheet Modal
import React, { useEffect } from 'react'
import { Command, Keyboard, X } from 'lucide-react'
import { SHORTCUT_CATALOG, type KeyboardShortcutItem } from '../engine/keyboardShortcuts'

type KeyboardShortcutsHelpModalProps = {
  onClose: () => void
}

export const KeyboardShortcutsHelpModal: React.FC<KeyboardShortcutsHelpModalProps> = ({
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const categories = ['Navigasi', 'Papan Kerja', 'Alat Fokus'] as const

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF7F2] w-full max-w-lg rounded-2xl border border-[#C9B99F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#FFFDF9] border-b border-[#E2D9C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C4A3E] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="shortcuts-modal-title"
                className="text-sm sm:text-base font-extrabold text-[#1E1915] leading-tight"
              >
                Pintasan Keyboard Desktop
              </h2>
              <p className="text-xs text-[#5C5148] font-medium">
                Kendalikan aplikasi lebih cepat tanpa perlu klik mouse
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela tombol pintas"
            className="p-1.5 rounded-lg text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {categories.map((category) => {
            const items = SHORTCUT_CATALOG.filter((s) => s.category === category)
            if (items.length === 0) return null

            return (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-black text-[#8C7E72] uppercase tracking-wider px-1">
                  {category}
                </h3>

                <div className="bg-[#FFFDF9] rounded-xl border border-[#E2D9C8] divide-y divide-[#E2D9C8]/60 overflow-hidden shadow-2xs">
                  {items.map((item: KeyboardShortcutItem) => (
                    <div
                      key={item.keyLabel}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[#1E1915] block leading-snug">
                          {item.actionName}
                        </span>
                        <span className="text-[11px] text-[#5C5148] block leading-snug">
                          {item.description}
                        </span>
                      </div>

                      <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md bg-[#FAF7F2] border border-[#C9B99F] text-[#1E1915] font-black text-xs shadow-2xs shrink-0 select-none">
                        {item.keyLabel}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FFFDF9] border-t border-[#E2D9C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#5C5148]">
            <Command className="w-3.5 h-3.5 text-[#2C4A3E]" />
            <span>Tekan <kbd className="font-bold text-[#1E1915]">Esc</kbd> kapan saja untuk menutup</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#2C4A3E] text-white text-xs font-bold hover:bg-[#21382F] transition-colors cursor-pointer shadow-2xs"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  )
}
