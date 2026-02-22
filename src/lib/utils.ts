import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' })
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${endDate.getFullYear()}`
  }
  
  return `${formatDate(start)} - ${formatDate(end)}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateCommission(price: number, rate = 0.12): {
  commission: number
  guidePayout: number
} {
  const commission = Math.round(price * rate * 100) / 100
  const guidePayout = Math.round((price - commission) * 100) / 100
  return { commission, guidePayout }
}

export const ACTIVITY_LABELS: Record<string, string> = {
  mountaineering: 'Mountaineering',
  rock_climbing: 'Rock Climbing',
  ice_climbing: 'Ice Climbing',
  ski_touring: 'Ski Touring',
  backcountry_skiing: 'Backcountry Skiing',
  hiking: 'Hiking',
  via_ferrata: 'Via Ferrata',
  alpine_climbing: 'Alpine Climbing',
  glacier_travel: 'Glacier Travel',
  canyoneering: 'Canyoneering',
  other: 'Other',
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
}
