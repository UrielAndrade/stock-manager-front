import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-800 text-slate-300 border-slate-700',
        primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        secondary: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
        purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, dot, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
        {dot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              variant === 'success' && 'bg-emerald-400',
              variant === 'warning' && 'bg-amber-400',
              variant === 'error' && 'bg-red-400',
              variant === 'primary' && 'bg-indigo-400',
              variant === 'secondary' && 'bg-sky-400',
              variant === 'purple' && 'bg-violet-400',
              (!variant || variant === 'default') && 'bg-slate-400',
            )}
          />
        )}
        {children}
      </span>
    )
  },
)
Badge.displayName = 'Badge'
