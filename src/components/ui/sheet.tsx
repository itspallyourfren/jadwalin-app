// src/components/ui/sheet.tsx - Accessible Slide-over Drawer Sheet (Shadcn pattern)
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
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 flex h-full w-[285px] sm:w-[320px] max-w-[85vw] flex-col bg-[#FAF7F2] border-[#E2D9C8] shadow-2xl transition-transform duration-250 ease-out',
          side === 'left' ? 'border-r animate-in slide-in-from-left' : 'ml-auto border-l animate-in slide-in-from-right',
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
