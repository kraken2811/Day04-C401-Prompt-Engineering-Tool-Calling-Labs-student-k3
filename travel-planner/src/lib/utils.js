import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const vnd = new Intl.NumberFormat('vi-VN')

export function formatVnd(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return vnd.format(Math.round(n))
}

export function formatDay(isoDate) {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
}
