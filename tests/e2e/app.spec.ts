import { test, expect } from '@playwright/test'

test.describe('Memory App - Parcours utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear localStorage
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('Page d\'accueil - affiche l\'état vide', async ({ page }) => {
    await expect(page.getByText('Bienvenue sur Memory !')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Créer une catégorie' })).toBeVisible()
  })

  test('Création d\'une catégorie', async ({ page }) => {
    await page.goto('/#/categories')
    await page.getByRole('button', { name: 'Nouvelle catégorie' }).click()

    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill form
    await page.getByLabel('Nom').fill('Espagnol')
    await page.getByLabel('Description').fill('Vocabulaire espagnol')

    // Submit
    await page.getByRole('button', { name: 'Créer' }).click()

    // Category should appear
    await expect(page.getByText('Espagnol')).toBeVisible()
  })

  test('Navigation - breadcrumb et liens', async ({ page }) => {
    // Navigate to categories
    await page.getByRole('link', { name: /Catégories/ }).click()
    await expect(page).toHaveURL(/#\/categories/)
  })

  test('Import de données de test', async ({ page }) => {
    await page.getByRole('button', { name: /Importer des données/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Importer' }).click()

    // Should show categories
    await expect(page.getByText('Espagnol')).toBeVisible()
    await expect(page.getByText('Histoire')).toBeVisible()
  })

  test('Accessibilité - navigation au clavier', async ({ page }) => {
    // Tab through navbar
    await page.keyboard.press('Tab')
    // Ensure focus is visible (skip button or navbar link)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement)
  })
})

test.describe('Gestion des cartes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())

    // Import test data first
    await page.reload()
    await page.getByRole('button', { name: /Importer des données/ }).click()
    await page.getByRole('button', { name: 'Importer' }).click()
  })

  test('Voir les cartes d\'un thème', async ({ page }) => {
    await page.goto('/#/categories')
    await page.getByRole('link', { name: 'Explorer' }).first().click()
    // Should show themes
    await expect(page.getByText('Vocabulaire débutant')).toBeVisible()
  })
})

test.describe('Session de révision', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /Importer des données/ }).click()
    await page.getByRole('button', { name: 'Importer' }).click()
  })

  test('Démarre une session de révision', async ({ page }) => {
    // Navigate to a theme and start review
    await page.goto('/#/review/theme-vocab-esp')
    // Should show review interface
    await expect(page.getByRole('main', { name: 'Carte de révision' })).toBeVisible()
  })
})
