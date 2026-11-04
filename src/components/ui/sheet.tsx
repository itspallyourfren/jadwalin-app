// src/components/ui/sheet.tsx - Accessible Slide-over Drawer Sheet (Upper Layer Overlay with Spring Animation & Dim Backdrop)
import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 flex overflow-hidden pointer-events-auto">
          {/* Dimmed Backdrop - Smooth Fade In & Out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel - Fluid Spring Physics */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ x: side === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'left' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'relative z-50 flex h-full w-[280px] sm:w-[320px] max-w-[85vw] flex-col bg-[#FAF7F2] border-[#E2D9C8] shadow-2xl select-none',
              side === 'left' ? 'border-r' : 'ml-auto border-l',
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
