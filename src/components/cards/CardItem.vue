<template>
  <div class="card-item" :class="{ 'card-item--mastered': isMastered }">
    <div class="card-item__sides">
      <div class="card-side card-side--front" aria-label="Recto">
        <span class="card-side__label">Recto</span>
        <div class="card-side__content">
          <p v-if="card.front.text">{{ card.front.text }}</p>
          <img
            v-if="card.front.media?.type === 'image'"
            :src="card.front.media.url"
            :alt="card.front.media.alt || 'Image recto'"
            class="card-media-img"
          />
          <audio
            v-if="card.front.media?.type === 'audio'"
            :src="card.front.media.url"
            controls
            class="card-media-audio"
          >
            <track kind="captions" />
          </audio>
        </div>
      </div>
      <div class="card-divider" aria-hidden="true">↔</div>
      <div class="card-side card-side--back" aria-label="Verso">
        <span class="card-side__label">Verso</span>
        <div class="card-side__content">
          <p v-if="card.back.text">{{ card.back.text }}</p>
          <img
            v-if="card.back.media?.type === 'image'"
            :src="card.back.media.url"
            :alt="card.back.media.alt || 'Image verso'"
            class="card-media-img"
          />
          <audio
            v-if="card.back.media?.type === 'audio'"
            :src="card.back.media.url"
            controls
            class="card-media-audio"
          >
            <track kind="captions" />
          </audio>
        </div>
      </div>
    </div>
    <div class="card-item__meta">
      <LevelBadge :level="card.level" :maxLevel="maxLevel" />
      <div class="card-item__actions">
        <button class="action-btn" @click="$emit('edit')" :aria-label="`Modifier la carte`">
          ✏️
        </button>
        <button class="action-btn" @click="$emit('delete')" :aria-label="`Supprimer la carte`">
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '@/types'
import LevelBadge from '@/components/ui/LevelBadge.vue'

const props = defineProps<{
  card: Card
  maxLevel: number
}>()

defineEmits<{
  edit: []
  delete: []
}>()

const isMastered = computed(() => props.card.level >= props.maxLevel)
</script>

<style scoped>
.card-item {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  border: 2px solid var(--color-surface-3);
  transition: border-color var(--transition-fast);
}

.card-item:hover {
  border-color: var(--color-accent);
}

.card-item--mastered {
  opacity: 0.7;
  border-style: dashed;
}

.card-item__sides {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  margin-bottom: var(--sp-3);
}

.card-side {
  flex: 1;
}

.card-side__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: var(--sp-1);
}

.card-side__content {
  font-size: 0.9rem;
  color: var(--color-ink);
}

.card-divider {
  color: var(--color-text-muted);
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 24px;
}

.card-media-img {
  max-height: 80px;
  border-radius: var(--radius-sm);
  margin-top: var(--sp-1);
}

.card-media-audio {
  width: 100%;
  height: 32px;
  margin-top: var(--sp-1);
}

.card-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--sp-3);
  border-top: 1px solid var(--color-surface-3);
}

.card-item__actions {
  display: flex;
  gap: var(--sp-1);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.card-item:hover .card-item__actions,
.card-item:focus-within .card-item__actions {
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
</style>
