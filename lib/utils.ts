import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export function getProgressColor(percent: number): string {
  if (percent < 40) return 'text-red-500'
  if (percent < 70) return 'text-yellow-500'
  return 'text-green-500'
}

export function getProgressBgColor(percent: number): string {
  if (percent < 40) return 'bg-red-500'
  if (percent < 70) return 'bg-yellow-500'
  return 'bg-green-500'
}
