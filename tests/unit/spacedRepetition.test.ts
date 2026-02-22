import { describe, it, expect } from 'vitest'
import {
  getIntervalForLevel,
  getNextReviewDate,
  isCardDueToday,
  getNewCards,
  processAnswer,
  getThemeProgress,
  getCardsDueTodayCount
} from '@/utils/spacedRepetition'
import type { Card, Theme } from '@/types'

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'c1',
    themeId: 't1',
    front: { text: 'Front' },
    back: { text: 'Back' },
    level: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function makeTheme(cards: Card[], overrides: Partial<Theme> = {}): Theme {
  return {
    id: 't1',
    categoryId: 'cat1',
    name: 'Test Theme',
    cards,
    maxLevel: 7,
    newCardsPerDay: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('getIntervalForLevel', () => {
  it('returns 0 for level 0', () => {
    expect(getIntervalForLevel(0)).toBe(0)
  })

  it('returns 1 for level 1', () => {
    expect(getIntervalForLevel(1)).toBe(1)
  })

  it('returns 2 for level 2', () => {
    expect(getIntervalForLevel(2)).toBe(2)
  })

  it('returns 4 for level 3', () => {
    expect(getIntervalForLevel(3)).toBe(4)
  })

  it('returns 8 for level 4', () => {
    expect(getIntervalForLevel(4)).toBe(8)
  })

  it('doubles for each level', () => {
    expect(getIntervalForLevel(5)).toBe(16)
    expect(getIntervalForLevel(6)).toBe(32)
    expect(getIntervalForLevel(7)).toBe(64)
  })
})

describe('isCardDueToday', () => {
  it('returns false for level 0 cards (not yet introduced)', () => {
    const card = makeCard({ level: 0 })
    expect(isCardDueToday(card, 7)).toBe(false)
  })

  it('returns false for mastered cards', () => {
    const card = makeCard({ level: 7 })
    expect(isCardDueToday(card, 7)).toBe(false)
  })

  it('returns true for level 1 card with no next review', () => {
    const card = makeCard({ level: 1 })
    expect(isCardDueToday(card, 7)).toBe(true)
  })

  it('returns true for card with past due date', () => {
    const card = makeCard({ level: 2, nextReview: '2020-01-01' })
    expect(isCardDueToday(card, 7)).toBe(true)
  })

  it('returns false for card due in the future', () => {
    const card = makeCard({ level: 2, nextReview: '2099-12-31' })
    expect(isCardDueToday(card, 7)).toBe(false)
  })
})

describe('getNewCards', () => {
  it('returns only level 0 cards', () => {
    const cards = [
      makeCard({ id: 'c1', level: 0 }),
      makeCard({ id: 'c2', level: 1 }),
      makeCard({ id: 'c3', level: 0 }),
    ]
    const newCards = getNewCards(cards, 10)
    expect(newCards).toHaveLength(2)
    expect(newCards.map(c => c.id)).toEqual(['c1', 'c3'])
  })

  it('respects the limit', () => {
    const cards = Array.from({ length: 20 }, (_, i) => makeCard({ id: `c${i}`, level: 0 }))
    const newCards = getNewCards(cards, 5)
    expect(newCards).toHaveLength(5)
  })
})

describe('processAnswer', () => {
  it('moves card from level 0 to level 1 on correct', () => {
    const card = makeCard({ level: 0 })
    const updated = processAnswer(card, true, 7)
    expect(updated.level).toBe(1)
  })

  it('increments level on correct answer', () => {
    const card = makeCard({ level: 3 })
    const updated = processAnswer(card, true, 7)
    expect(updated.level).toBe(4)
  })

  it('does not exceed maxLevel', () => {
    const card = makeCard({ level: 7 })
    const updated = processAnswer(card, true, 7)
    expect(updated.level).toBe(7)
  })

  it('resets to level 1 on incorrect answer', () => {
    const card = makeCard({ level: 5 })
    const updated = processAnswer(card, false, 7)
    expect(updated.level).toBe(1)
  })

  it('keeps level 1 on incorrect answer at level 1', () => {
    const card = makeCard({ level: 1 })
    const updated = processAnswer(card, false, 7)
    expect(updated.level).toBe(1)
  })

  it('updates lastReviewed', () => {
    const card = makeCard({ level: 1 })
    const updated = processAnswer(card, true, 7)
    expect(updated.lastReviewed).toBeDefined()
    expect(new Date(updated.lastReviewed!).getTime()).toBeGreaterThan(0)
  })

  it('no nextReview for mastered card', () => {
    const card = makeCard({ level: 6 })
    const updated = processAnswer(card, true, 7)
    expect(updated.level).toBe(7)
    expect(updated.nextReview).toBeUndefined()
  })
})

describe('getThemeProgress', () => {
  it('returns 0 for empty theme', () => {
    const theme = makeTheme([])
    expect(getThemeProgress(theme)).toBe(0)
  })

  it('returns 100 when all cards mastered', () => {
    const cards = [makeCard({ level: 7 }), makeCard({ level: 7 })]
    const theme = makeTheme(cards)
    expect(getThemeProgress(theme)).toBe(100)
  })

  it('returns correct percentage', () => {
    const cards = [
      makeCard({ level: 7 }),
      makeCard({ level: 7 }),
      makeCard({ level: 3 }),
      makeCard({ level: 0 }),
    ]
    const theme = makeTheme(cards)
    expect(getThemeProgress(theme)).toBe(50) // 2/4 = 50%
  })
})
