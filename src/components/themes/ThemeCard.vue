<template>
  <article class="theme-card">
    <div class="theme-card__header">
      <h3 class="theme-card__name">{{ theme.name }}</h3>
      <div class="theme-card__actions">
        <button
          class="action-btn"
          @click.stop="$emit('edit')"
          :aria-label="`Modifier ${theme.name}`"
        >
          ✏️
        </button>
        <button
          class="action-btn"
          @click.stop="$emit('delete')"
          :aria-label="`Supprimer ${theme.name}`"
        >
          🗑️
        </button>
      </div>
    </div>

    <p v-if="theme.description" class="theme-card__desc">{{ theme.description }}</p>

    <div class="theme-card__progress">
      <ProgressBar :value="progress" :aria-label="`Progression: ${progress}%`" />
      <span class="progress-label">{{ progress }}% maîtrisé</span>
    </div>

    <div class="theme-card__stats">
      <div class="stat-item">
        <span class="stat-value">{{ theme.cards.length }}</span>
        <span class="stat-label">Cartes</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ dueCount }}</span>
        <span class="stat-label">À réviser</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ mastered }}</span>
        <span class="stat-label">Maîtrisées</span>
      </div>
    </div>

    <div class="theme-card__footer">
      <router-link :to="`/themes/${theme.id}`" class="theme-link"> Gérer les cartes </router-link>
      <AppButton v-if="dueCount > 0" variant="primary" size="sm" @click.stop="$emit('review')">
        Réviser ({{ dueCount }})
      </AppButton>
      <span v-else-if="theme.cards.length === 0" class="no-cards-hint">Ajoutez des cartes</span>
      <span v-else class="all-done">✓ À jour</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Theme } from '@/types'
import { getCardsDueTodayCount, getThemeProgress } from '@/utils/spacedRepetition'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{
  theme: Theme
}>()

defineEmits<{
  edit: []
  delete: []
  review: []
}>()

const progress = computed(() => getThemeProgress(props.theme))
const dueCount = computed(() => getCardsDueTodayCount(props.theme))
const mastered = computed(
  () => props.theme.cards.filter((c) => c.level >= props.theme.maxLevel).length,
)
</script>

<style scoped>
.theme-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--sp-5);
  border: 2px solid var(--color-surface-3);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.theme-card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
}

.theme-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-2);
}

.theme-card__name {
  font-size: 1rem;
  font-weight: 700;
  flex: 1;
}

.theme-card__actions {
  display: flex;
  gap: var(--sp-1);
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.theme-card:hover .theme-card__actions,
.theme-card:focus-within .theme-card__actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: none;
  border: none;
  transition: background var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-surface-2);
}

.theme-card__desc {
  font-size: 0.85rem;
  color: var(--color-text-soft);
  line-height: 1.4;
}

.theme-card__progress {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.progress-label {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  font-weight: 500;
}

.theme-card__stats {
  display: flex;
  gap: var(--sp-4);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-ink);
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--sp-1);
}

.theme-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.theme-link {
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-display);
  color: var(--color-ink);
  border-bottom: 1px solid var(--color-surface-3);
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.theme-link:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.no-cards-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.all-done {
  font-size: 0.85rem;
  color: var(--color-success);
  font-weight: 600;
}
</style>
