import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Category, Theme, Card, AppSettings, CardSide } from '@/types'
import { generateId } from '@/utils/helpers'
import { getCardsDueTodayCount, getThemeProgress } from '@/utils/spacedRepetition'

const STORAGE_KEY = 'memory-app-data'
const SETTINGS_KEY = 'memory-app-settings'

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const useMemoryStore = defineStore('memory', () => {
  const categories = ref<Category[]>(loadFromStorage(STORAGE_KEY, []))
  const settings = ref<AppSettings>(
    loadFromStorage(SETTINGS_KEY, {
      notificationsEnabled: false,
      notificationTime: '09:00',
      defaultMaxLevel: 7,
      defaultNewCardsPerDay: 10,
      language: 'fr'
    })
  )

  function persist() { saveToStorage(STORAGE_KEY, categories.value) }
  function persistSettings() { saveToStorage(SETTINGS_KEY, settings.value) }

  const totalCards = computed(() =>
    categories.value.reduce((t, cat) =>
      t + cat.themes.reduce((tt, theme) => tt + theme.cards.length, 0), 0)
  )
  const totalThemes = computed(() =>
    categories.value.reduce((t, cat) => t + cat.themes.length, 0)
  )
  const cardsDueToday = computed(() =>
    categories.value.reduce((t, cat) =>
      t + cat.themes.reduce((tt, theme) => tt + getCardsDueTodayCount(theme), 0), 0)
  )

  // ── Notification scheduling ──────────────────────────────────────────────
  let notifTimer: ReturnType<typeof setTimeout> | null = null

  function scheduleNextNotification() {
    if (notifTimer) clearTimeout(notifTimer)
    if (!settings.value.notificationsEnabled) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const [h, m] = settings.value.notificationTime.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1) // next day if past

    const ms = target.getTime() - now.getTime()

    notifTimer = setTimeout(() => {
      const count = cardsDueToday.value
      if (count > 0) {
        new Notification('Memory App – Révisions du jour !', {
          body: `Vous avez ${count} carte${count > 1 ? 's' : ''} à réviser aujourd'hui.`,
          icon: '/favicon.svg',
          tag: 'memory-daily'
        })
      }
      // Reschedule for next day
      scheduleNextNotification()
    }, ms)
  }

  // Auto-fire scheduler on settings change
  watch(
    () => [settings.value.notificationsEnabled, settings.value.notificationTime],
    () => scheduleNextNotification(),
    { immediate: true }
  )

  async function requestAndEnableNotifications(): Promise<boolean> {
    if (!('Notification' in window)) return false
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      updateSettings({ notificationsEnabled: true })
      return true
    }
    return false
  }

  // ── Category CRUD ────────────────────────────────────────────────────────
  function createCategory(data: Pick<Category, 'name' | 'description' | 'color' | 'icon'>): Category {
    const now = new Date().toISOString()
    const category: Category = { id: generateId(), themes: [], createdAt: now, updatedAt: now, ...data }
    categories.value.push(category)
    persist()
    return category
  }

  function updateCategory(id: string, data: Partial<Pick<Category, 'name' | 'description' | 'color' | 'icon'>>): void {
    const cat = categories.value.find(c => c.id === id)
    if (cat) { Object.assign(cat, { ...data, updatedAt: new Date().toISOString() }); persist() }
  }

  function deleteCategory(id: string): void {
    categories.value = categories.value.filter(c => c.id !== id)
    persist()
  }

  function getCategoryById(id: string): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  // ── Theme CRUD ────────────────────────────────────────────────────────────
  function createTheme(categoryId: string, data: Pick<Theme, 'name' | 'description' | 'maxLevel' | 'newCardsPerDay'>): Theme | null {
    const category = getCategoryById(categoryId)
    if (!category) return null
    const now = new Date().toISOString()
    const theme: Theme = { id: generateId(), categoryId, cards: [], createdAt: now, updatedAt: now, ...data }
    category.themes.push(theme)
    persist()
    return theme
  }

  function updateTheme(themeId: string, data: Partial<Pick<Theme, 'name' | 'description' | 'maxLevel' | 'newCardsPerDay'>>): void {
    for (const cat of categories.value) {
      const theme = cat.themes.find(t => t.id === themeId)
      if (theme) { Object.assign(theme, { ...data, updatedAt: new Date().toISOString() }); persist(); return }
    }
  }

  function deleteTheme(themeId: string): void {
    for (const cat of categories.value) {
      const idx = cat.themes.findIndex(t => t.id === themeId)
      if (idx !== -1) { cat.themes.splice(idx, 1); persist(); return }
    }
  }

  function getThemeById(themeId: string): { theme: Theme; category: Category } | null {
    for (const cat of categories.value) {
      const theme = cat.themes.find(t => t.id === themeId)
      if (theme) return { theme, category: cat }
    }
    return null
  }

  // ── Card CRUD ─────────────────────────────────────────────────────────────
  function createCard(themeId: string, data: { front: CardSide; back: CardSide }): Card | null {
    const result = getThemeById(themeId)
    if (!result) return null
    const now = new Date().toISOString()
    const card: Card = { id: generateId(), themeId, front: data.front, back: data.back, level: 0, createdAt: now, updatedAt: now }
    result.theme.cards.push(card)
    result.theme.updatedAt = now
    persist()
    return card
  }

  function updateCard(cardId: string, data: Partial<Pick<Card, 'front' | 'back' | 'level' | 'lastReviewed' | 'nextReview'>>): void {
    for (const cat of categories.value) {
      for (const theme of cat.themes) {
        const card = theme.cards.find(c => c.id === cardId)
        if (card) { Object.assign(card, { ...data, updatedAt: new Date().toISOString() }); persist(); return }
      }
    }
  }

  function deleteCard(cardId: string): void {
    for (const cat of categories.value) {
      for (const theme of cat.themes) {
        const idx = theme.cards.findIndex(c => c.id === cardId)
        if (idx !== -1) { theme.cards.splice(idx, 1); persist(); return }
      }
    }
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  function updateSettings(data: Partial<AppSettings>): void {
    Object.assign(settings.value, data)
    persistSettings()
  }

  // ── Import / Export ───────────────────────────────────────────────────────
  function importData(data: Category[]): void {
    categories.value = data
    persist()
  }

  function exportData(): string {
    return JSON.stringify(categories.value, null, 2)
  }

  /** Export only selected category ids */
  function exportCategories(ids: string[]): string {
    const data = categories.value.filter(c => ids.includes(c.id))
    return JSON.stringify(data, null, 2)
  }

  /** Merge imported categories (by id – update if exists, add if new) */
  function mergeImportedCategories(data: Category[]): void {
    for (const incoming of data) {
      const existing = categories.value.findIndex(c => c.id === incoming.id)
      if (existing !== -1) {
        categories.value[existing] = incoming
      } else {
        categories.value.push(incoming)
      }
    }
    persist()
  }

  return {
    categories, settings,
    totalCards, totalThemes, cardsDueToday,
    createCategory, updateCategory, deleteCategory, getCategoryById,
    createTheme, updateTheme, deleteTheme, getThemeById,
    createCard, updateCard, deleteCard,
    updateSettings,
    importData, exportData, exportCategories, mergeImportedCategories,
    requestAndEnableNotifications,
    getThemeProgress: (theme: Theme) => getThemeProgress(theme),
    getCardsDueTodayCount: (theme: Theme) => getCardsDueTodayCount(theme)
  }
})