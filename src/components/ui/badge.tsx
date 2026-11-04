// src/components/ui/badge.tsx - Shadcn-grade Minimal Badge Component
import * as React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'terracotta' | 'success' | 'small' | 'medium' | 'large' | 'final'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold leading-normal'

  const variantStyles = {
    default: 'bg-[#2C4A3E] text-[#FAF7F2]',
    secondary: 'bg-[#F2ECE1] text-[#5C5148] border border-[#E2D9C8]',
    outline: 'border border-[#E2D9C8] text-[#1E1915] bg-[#FFFDF9]',
    terracotta: 'bg-[#FDECE8] text-[#D4532F] border border-[#D4532F]/20',
    success: 'bg-[#E7F6EE] text-[#1F7A4C] border border-[#1F7A4C]/30',
    small: 'bg-[#EBF1FF] text-[#2B59C3] border border-[#2B59C3]/20',
    medium: 'bg-[#FEF3E2] text-[#B86B14] border border-[#B86B14]/20',
    large: 'bg-[#FDECE8] text-[#C8432B] border border-[#C8432B]/20',
    final: 'bg-[#F5EBFF] text-[#6B21A8] border border-[#6B21A8]/20',
  }

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)} {...props} />
  )
}
