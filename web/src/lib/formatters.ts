import type { PresetBill } from '../types/models'

export const PRESET_BILLS: PresetBill[] = [
  { icon: '⚡', title: 'Electricity', amount: 3000 },
  { icon: '📶', title: 'High-Speed WiFi', amount: 1500 },
  { icon: '🛒', title: 'Groceries', amount: 4500 },
  { icon: '🏠', title: 'Maintenance', amount: 2000 },
]

export const AVATAR_PALETTES = [
  { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
  { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
  { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
  { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
]

const DEFAULT_AVATAR = { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' }

export function getAvatarPalette(index: number) {
  return AVATAR_PALETTES[index % AVATAR_PALETTES.length] ?? DEFAULT_AVATAR
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]?.substring(0, 2).toUpperCase() || '?'
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

export function formatMoney(cents: number): string {
  return `₹${(cents / 100).toFixed(2)}`
}
