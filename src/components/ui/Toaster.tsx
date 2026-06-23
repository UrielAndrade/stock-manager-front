import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotificationStore } from '@/store'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: 'border-emerald-500/30 bg-emerald-500/5',
  error: 'border-red-500/30 bg-red-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  info: 'border-indigo-500/30 bg-indigo-500/5',
}

const iconStyles = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-indigo-400',
}

export function Toaster() {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
      {notifications.map((n) => {
        const Icon = icons[n.type]
        return (
          <ToastPrimitive.Root
            key={n.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 shadow-2xl',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
              'min-w-[320px] max-w-[420px] bg-slate-900',
              toastStyles[n.type],
            )}
            onOpenChange={(open) => {
              if (!open) removeNotification(n.id)
            }}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[n.type])} />
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm font-semibold text-slate-100">
                {n.title}
              </ToastPrimitive.Title>
              {n.message && (
                <ToastPrimitive.Description className="text-xs text-slate-400 mt-0.5">
                  {n.message}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              className="text-slate-500 hover:text-slate-100 transition-colors rounded p-0.5"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" />
    </ToastPrimitive.Provider>
  )
}

// Hook for easy toast usage
export function useToast() {
  const { addNotification } = useNotificationStore()
  return {
    success: (title: string, message?: string) =>
      addNotification({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addNotification({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      addNotification({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addNotification({ type: 'info', title, message }),
  }
}
