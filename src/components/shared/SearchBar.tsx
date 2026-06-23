import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className }: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-4',
          'text-sm text-slate-100 placeholder:text-slate-600',
          'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50',
          'transition-all duration-200',
        )}
        aria-label={placeholder}
      />
    </div>
  )
}
