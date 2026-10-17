import type { Level } from '@/types'

export const levels: Level[] = [
  { name: 'Semente', minPoints: 0, maxPoints: 99, icon: 'Sprout', color: '#a8a29e' },
  { name: 'Broto', minPoints: 100, maxPoints: 299, icon: 'Leaf', color: '#22c55e' },
  { name: 'Arvore', minPoints: 300, maxPoints: 699, icon: 'Trees', color: '#16a34a' },
  { name: 'Guardiao Ambiental', minPoints: 700, maxPoints: 99999, icon: 'Globe', color: '#15803d' },
]

export function getLevelForPoints(points: number): Level {
  return levels.slice().reverse().find(l => points >= l.minPoints) ?? levels[0]!
}

export function getNextLevel(points: number): Level | null {
  const current = getLevelForPoints(points)
  const idx = levels.indexOf(current)
  return idx < levels.length - 1 ? (levels[idx + 1] ?? null) : null
}

export function getLevelProgress(points: number): number {
  const current = getLevelForPoints(points)
  const next = getNextLevel(points)
  if (!next) return 100
  const range = next.minPoints - current.minPoints
  const earned = points - current.minPoints
  return Math.min(100, Math.round((earned / range) * 100))
}
