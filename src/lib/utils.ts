import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function truncateUUID(uuid: string): string {
  return uuid.slice(0, 8) + '...'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    case 'executed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    case 'canceled': return 'text-red-400 bg-red-400/10 border-red-400/20'
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  }
}

export function getOrderTypeColor(type: string): string {
  switch (type) {
    case 'buy': return 'text-sky-400 bg-sky-400/10 border-sky-400/20'
    case 'sell': return 'text-violet-400 bg-violet-400/10 border-violet-400/20'
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  }
}

export function getStockStatus(quantity: number): { label: string; color: string } {
  if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-400' }
  if (quantity < 10) return { label: 'Low Stock', color: 'text-amber-400' }
  if (quantity < 50) return { label: 'In Stock', color: 'text-emerald-400' }
  return { label: 'Well Stocked', color: 'text-emerald-400' }
}

export function calculateTotalValue(products: Array<{ price: number; quantity: number }>): number {
  return products.reduce((sum, p) => sum + p.price * p.quantity, 0)
}
