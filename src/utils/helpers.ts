/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get today's date as ISO string (date only)
 */
export function today(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Format date for display
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
