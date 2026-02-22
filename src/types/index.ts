// Core data types for Memory App

export interface MediaContent {
  type: 'image' | 'audio' | 'video'
  url: string
  alt?: string
}

export interface CardSide {
  text?: string
  media?: MediaContent
}

export interface Card {
  id: string
  themeId: string
  front: CardSide
  back: CardSide
  level: number // 0 = not introduced, 1-maxLevel = active
  lastReviewed?: string // ISO date string
  nextReview?: string // ISO date string
  createdAt: string
  updatedAt: string
}

export interface Theme {
  id: string
  categoryId: string
  name: string
  description?: string
  cards: Card[]
  // Review config
  maxLevel: number // default 7
  newCardsPerDay: number // default 10
  // Review tracking
  reviewStartedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  themes: Theme[]
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  notificationsEnabled: boolean
  notificationTime: string // HH:MM
  defaultMaxLevel: number
  defaultNewCardsPerDay: number
  language: string
}

export interface ReviewSession {
  themeId: string
  date: string // ISO date
  cardsReviewed: string[] // card ids
  correct: number
  incorrect: number
}

export interface ReviewStats {
  themeId: string
  totalReviewed: number
  totalCorrect: number
  streak: number
  lastReviewDate?: string
}

// Helper type for card with theme info during review
export interface CardForReview {
  card: Card
  theme: Theme
  category: Category
}

export type ReviewPhase = 'showing-front' | 'showing-back' | 'result'

export interface ReviewState {
  sessionCards: CardForReview[]
  currentIndex: number
  phase: ReviewPhase
  sessionStats: { correct: number; incorrect: number }
}
