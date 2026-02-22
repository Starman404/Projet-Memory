import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMemoryStore } from '@/stores/memory'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Memory Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
  })

  describe('Categories', () => {
    it('creates a category', () => {
      const store = useMemoryStore()
      store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      expect(store.categories).toHaveLength(1)
      expect(store.categories[0].name).toBe('Test')
    })

    it('updates a category', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      store.updateCategory(cat.id, { name: 'Updated' })
      expect(store.categories[0].name).toBe('Updated')
    })

    it('deletes a category', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      store.deleteCategory(cat.id)
      expect(store.categories).toHaveLength(0)
    })

    it('counts total themes', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      store.createTheme(cat.id, { name: 'Theme 1', maxLevel: 7, newCardsPerDay: 10 })
      store.createTheme(cat.id, { name: 'Theme 2', maxLevel: 7, newCardsPerDay: 10 })
      expect(store.totalThemes).toBe(2)
    })
  })

  describe('Themes', () => {
    it('creates a theme in a category', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      const theme = store.createTheme(cat.id, { name: 'Theme', maxLevel: 7, newCardsPerDay: 10 })
      expect(theme).not.toBeNull()
      expect(store.categories[0].themes).toHaveLength(1)
    })

    it('deletes a theme', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      const theme = store.createTheme(cat.id, { name: 'Theme', maxLevel: 7, newCardsPerDay: 10 })!
      store.deleteTheme(theme.id)
      expect(store.categories[0].themes).toHaveLength(0)
    })

    it('finds theme by id', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      const theme = store.createTheme(cat.id, { name: 'Theme', maxLevel: 7, newCardsPerDay: 10 })!
      const found = store.getThemeById(theme.id)
      expect(found).not.toBeNull()
      expect(found!.theme.name).toBe('Theme')
    })
  })

  describe('Cards', () => {
    it('creates a card in a theme', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      const theme = store.createTheme(cat.id, { name: 'Theme', maxLevel: 7, newCardsPerDay: 10 })!
      const card = store.createCard(theme.id, {
        front: { text: 'Front' },
        back: { text: 'Back' }
      })
      expect(card).not.toBeNull()
      expect(card!.level).toBe(0)
      expect(store.totalCards).toBe(1)
    })

    it('updates a card', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      const theme = store.createTheme(cat.id, { name: 'Theme', maxLevel: 7, newCardsPerDay: 10 })!
      const card = store.createCard(theme.id, {
        front: { text: 'Front' },
        back: { text: 'Back' }
      })!
      store.updateCard(card.id, { level: 3 })
      const result = store.getThemeById(theme.id)
      expect(result!.theme.cards[0].level).toBe(3)
    })

    it('deletes a card', () => {
      const store = useMemoryStore()
      const cat = store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      const theme = store.createTheme(cat.id, { name: 'Theme', maxLevel: 7, newCardsPerDay: 10 })!
      const card = store.createCard(theme.id, {
        front: { text: 'Front' },
        back: { text: 'Back' }
      })!
      store.deleteCard(card.id)
      expect(store.totalCards).toBe(0)
    })
  })

  describe('Import/Export', () => {
    it('imports data correctly', () => {
      const store = useMemoryStore()
      const data = [{
        id: 'cat1',
        name: 'Imported',
        color: '#ff0000',
        icon: '📚',
        themes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
      store.importData(data)
      expect(store.categories).toHaveLength(1)
      expect(store.categories[0].name).toBe('Imported')
    })

    it('exports data as JSON string', () => {
      const store = useMemoryStore()
      store.createCategory({ name: 'Test', color: '#ff0000', icon: '📚' })
      const exported = store.exportData()
      const parsed = JSON.parse(exported)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].name).toBe('Test')
    })
  })
})
