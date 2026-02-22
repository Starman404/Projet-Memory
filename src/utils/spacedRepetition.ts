import type { Card, Theme } from '@/types'

/**
 * SPACED REPETITION ALGORITHM
 *
 * Level 0       → New, not yet introduced
 * Level 1       → Review every 1 day   (2^0)
 * Level 2       → Review every 2 days  (2^1)
 * Level 3       → Review every 4 days  (2^2)
 * Level N       → Review every 2^(N-1) days
 * Level maxLevel → Mastered, no more reviews
 *
 * Daily queue order: highest level due first → level 1 → new cards
 * ✓ Correct → level++, nextReview = today + 2^(newLevel-1) days
 * ✗ Wrong   → level = 1, nextReview = tomorrow, card re-queued at end
 */

export function getIntervalForLevel(level: number): number {
  if (level <= 0) return 0
  return Math.pow(2, level - 1)
}

/**
 * Today as YYYY-MM-DD using LOCAL date (not UTC).
 * Critical: toISOString() is UTC — changing system clock forward a day
 * won't be seen if UTC hasn't crossed midnight yet.
 */
export function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function futureDateStr(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Alias kept for backward compatibility with older code */
export function getNextReviewDate(level: number): string {
  return futureDateStr(getIntervalForLevel(level))
}

export function isCardDueToday(card: Card, maxLevel: number): boolean {
  if (card.level <= 0) return false
  if (card.level >= maxLevel) return false
  if (!card.nextReview) return true
  return card.nextReview <= todayStr()
}

export function getNewCards(cards: Card[], limit: number): Card[] {
  return cards.filter(c => c.level === 0).slice(0, limit)
}

export function getCardsForTodayReview(theme: Theme): Card[] {
  const { cards, maxLevel, newCardsPerDay } = theme
  const highLevel = cards
    .filter(c => c.level >= 2 && c.level < maxLevel && isCardDueToday(c, maxLevel))
    .sort((a, b) => b.level - a.level)
  const level1 = cards.filter(c => c.level === 1 && isCardDueToday(c, maxLevel))
  const newCards = getNewCards(cards, newCardsPerDay)
  return [...highLevel, ...level1, ...newCards]
}

export function processCorrectAnswer(card: Card, maxLevel: number): Card {
  const now = new Date().toISOString()
  const newLevel = Math.min(card.level === 0 ? 1 : card.level + 1, maxLevel)
  const nextReview = newLevel >= maxLevel ? undefined : futureDateStr(getIntervalForLevel(newLevel))
  return { ...card, level: newLevel, lastReviewed: now, nextReview, updatedAt: now }
}

export function processWrongAnswer(card: Card): Card {
  const now = new Date().toISOString()
  return { ...card, level: 1, lastReviewed: now, nextReview: futureDateStr(1), updatedAt: now }
}

/** Unified helper used by unit tests */
export function processAnswer(card: Card, correct: boolean, maxLevel: number): Card {
  return correct ? processCorrectAnswer(card, maxLevel) : processWrongAnswer(card)
}

export function getCardsDueTodayCount(theme: Theme): number {
  return getCardsForTodayReview(theme).length
}

export function getThemeProgress(theme: Theme): number {
  if (theme.cards.length === 0) return 0
  const mastered = theme.cards.filter(c => c.level >= theme.maxLevel).length
  return Math.round((mastered / theme.cards.length) * 100)
}

/**
 * Level distribution — always includes ALL levels from 0 to maxLevel
 * so bars never disappear when a level hits zero.
 */
export function getLevelDistribution(theme: Theme): Record<number, number> {
  const dist: Record<number, number> = {}
  for (let i = 0; i <= theme.maxLevel; i++) dist[i] = 0
  for (const card of theme.cards) {
    const lvl = Math.min(card.level, theme.maxLevel)
    dist[lvl] = (dist[lvl] || 0) + 1
  }
  return dist
}

/**
 * Global distribution across all categories.
 * Always shows levels 0–7 even if empty.
 */
export function getGlobalLevelDistribution(
  categories: { themes: Theme[] }[]
): Record<number, number> {
  const dist: Record<number, number> = {}
  for (let i = 0; i <= 7; i++) dist[i] = 0
  for (const cat of categories) {
    for (const theme of cat.themes) {
      for (const card of theme.cards) {
        const lvl = Math.min(card.level, 7)
        dist[lvl] = (dist[lvl] || 0) + 1
      }
    }
  }
  return dist
}

/**
 * Returns which level numbers have cards due today in a theme.
 * Level 0 is included if there are new cards to introduce.
 */
export function getDueLevelsToday(theme: Theme): number[] {
  const dueLevels = new Set<number>()
  for (const card of theme.cards) {
    if (card.level >= 1 && isCardDueToday(card, theme.maxLevel)) {
      dueLevels.add(card.level)
    }
  }
  if (getNewCards(theme.cards, theme.newCardsPerDay).length > 0) {
    dueLevels.add(0)
  }
  return [...dueLevels].sort((a, b) => a - b)
}