// src/components/ui/sheet.tsx - Accessible Slide-over Drawer Sheet (Upper Layer Overlay with Dim Backdrop)
import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SheetProps {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right'
  className?: string
  children: React.ReactNode
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onClose,
  side = 'left',
  className,
  children,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden pointer-events-auto">
      {/* Dimmed Backdrop - Dims the dashboard behind the drawer */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity cursor-pointer animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel - Upper Layer Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 flex h-full w-[280px] sm:w-[320px] max-w-[85vw] flex-col bg-[#FAF7F2] border-[#E2D9C8] shadow-2xl transition-transform duration-250 ease-out select-none',
          side === 'left'
            ? 'border-r animate-in slide-in-from-left'
            : 'ml-auto border-l animate-in slide-in-from-right',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export const SheetClose: React.FC<{ onClick: () => void; className?: string }> = ({
  onClick,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Tutup panel"
    className={cn(
      'p-1.5 rounded-lg text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1] cursor-pointer transition-colors',
      className
    )}
  >
    <X className="w-4 h-4" />
  </button>
)
