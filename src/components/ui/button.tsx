// src/components/ui/button.tsx - Shadcn-grade Accessible Button Component
import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'terracotta'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    const baseStyles =
      'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer'

    const variantStyles = {
      default: 'bg-[#2C4A3E] text-[#FAF7F2] hover:bg-[#21382F] shadow-2xs',
      terracotta: 'bg-[#D4532F] text-white hover:bg-[#B84322] shadow-2xs',
      destructive: 'bg-[#C8432B] text-white hover:bg-[#A83521]',
      outline:
        'border border-[#E2D9C8] bg-[#FFFDF9] text-[#1E1915] hover:bg-[#F2ECE1] hover:border-[#C9B99F]',
      secondary: 'bg-[#F2ECE1] text-[#1E1915] hover:bg-[#E2D9C8]',
      ghost: 'text-[#5C5148] hover:text-[#1E1915] hover:bg-[#F2ECE1]',
    }

    const sizeStyles = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 py-1.5 text-xs',
      lg: 'h-11 px-5 py-2.5 text-sm',
      icon: 'h-10 w-10 p-0',
      'icon-sm': 'h-8 w-8 p-0',
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
