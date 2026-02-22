<template>
  <article class="cat-card" :style="{ '--cat-color': category.color }">
    <div class="cat-card__header">
      <div class="cat-card__icon" aria-hidden="true">{{ category.icon || '📚' }}</div>
      <div class="cat-card__actions">
        <button
          class="cat-card__action-btn"
          @click.stop="$emit('edit')"
          :aria-label="`Modifier ${category.name}`"
        >
          ✏️
        </button>
        <button
          class="cat-card__action-btn"
          @click.stop="$emit('delete')"
          :aria-label="`Supprimer ${category.name}`"
        >
          🗑️
        </button>
      </div>
    </div>
    <h3 class="cat-card__name">{{ category.name }}</h3>
    <p v-if="category.description" class="cat-card__desc">{{ category.description }}</p>
    <div class="cat-card__stats">
      <span class="stat">
        <strong>{{ category.themes.length }}</strong> thème{{
          category.themes.length !== 1 ? 's' : ''
        }}
      </span>
      <span class="stat">
        <strong>{{ totalCards }}</strong> carte{{ totalCards !== 1 ? 's' : '' }}
      </span>
    </div>
    <router-link
      :to="`/categories/${category.id}`"
      class="cat-card__link"
      :aria-label="`Voir ${category.name}`"
    >
      Explorer →
    </router-link>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@/types'

const props = defineProps<{
  category: Category
}>()

defineEmits<{
  edit: []
  delete: []
}>()

const totalCards = computed(() => props.category.themes.reduce((sum, t) => sum + t.cards.length, 0))
</script>

<style scoped>
.cat-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--sp-6);
  border: 2px solid var(--color-surface-3);
  border-top: 4px solid var(--cat-color, var(--color-accent));
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.cat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.cat-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.cat-card__icon {
  font-size: 2rem;
  line-height: 1;
}

.cat-card__actions {
  display: flex;
  gap: var(--sp-1);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.cat-card:hover .cat-card__actions,
.cat-card:focus-within .cat-card__actions {
  opacity: 1;
}

.cat-card__action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
  cursor: pointer;
  background: none;
  border: none;
}

.cat-card__action-btn:hover {
  background: var(--color-surface-2);
}

.cat-card__name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-ink);
}

.cat-card__desc {
  font-size: 0.85rem;
  color: var(--color-text-soft);
  line-height: 1.5;
  flex: 1;
}

.cat-card__stats {
  display: flex;
  gap: var(--sp-4);
}

.stat {
  font-size: 0.85rem;
  color: var(--color-text-soft);
}

.stat strong {
  font-family: var(--font-display);
  color: var(--color-ink);
}

.cat-card__link {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--cat-color, var(--color-accent));
  margin-top: var(--sp-2);
  transition: gap var(--transition-fast);
}

.cat-card__link:hover {
  gap: var(--sp-2);
}
</style>
