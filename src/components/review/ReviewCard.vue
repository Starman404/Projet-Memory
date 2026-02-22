<template>
  <div class="review-card-wrapper">
    <!-- Card flip container -->
    <div
      class="flip-container"
      :class="{ flipped: isFlipped }"
      role="button"
      tabindex="0"
      :aria-label="
        isFlipped
          ? 'Verso de la carte, appuyez sur Espace pour voir le recto'
          : 'Recto de la carte, appuyez sur Espace pour révéler le verso'
      "
      @click="flip"
      @keydown.space.prevent="flip"
      @keydown.enter.prevent="flip"
    >
      <div class="card-face card-face--front">
        <div class="card-face__inner">
          <p class="card-face__hint">Cliquez pour révéler</p>
          <CardContent :side="card.front" />
        </div>
      </div>
      <div class="card-face card-face--back" aria-hidden="!isFlipped">
        <div class="card-face__inner">
          <CardContent :side="card.back" />
        </div>
      </div>
    </div>

    <!-- Answer buttons - shown after flip -->
    <transition name="answer-fade">
      <div
        v-if="isFlipped"
        class="answer-buttons"
        role="group"
        aria-label="Votre réponse était-elle correcte ?"
      >
        <button
          class="answer-btn answer-btn--wrong"
          @click="$emit('answer', false)"
          aria-label="Réponse incorrecte"
        >
          <span aria-hidden="true">✗</span>
          <span>Incorrect</span>
        </button>
        <button
          class="answer-btn answer-btn--correct"
          @click="$emit('answer', true)"
          aria-label="Réponse correcte"
        >
          <span aria-hidden="true">✓</span>
          <span>Correct</span>
        </button>
      </div>
    </transition>

    <!-- Level info -->
    <div class="level-info" aria-live="polite">
      <LevelBadge :level="card.level" :maxLevel="maxLevel" />
      <span class="level-text">{{ levelLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card } from '@/types'
import LevelBadge from '@/components/ui/LevelBadge.vue'
import CardContent from './CardContent.vue'

const props = defineProps<{
  card: Card
  maxLevel: number
}>()

const emit = defineEmits<{
  answer: [correct: boolean]
}>()

const isFlipped = ref(false)

const levelLabel = computed(() => {
  if (props.card.level === 0) return 'Nouvelle carte'
  if (props.card.level >= props.maxLevel) return 'Maîtrisée !'
  return `Niveau ${props.card.level} • Intervalle: ${Math.pow(2, props.card.level - 1)} jour(s)`
})

function flip() {
  isFlipped.value = true
}

// Reset flip when card changes
defineExpose({
  resetFlip: () => {
    isFlipped.value = false
  },
})
</script>

<style scoped>
.review-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-6);
}

.flip-container {
  width: 100%;
  max-width: 600px;
  aspect-ratio: 5/3;
  perspective: 1000px;
  cursor: pointer;
}

.flip-container.flipped .card-face--front {
  transform: rotateY(-180deg);
}

.flip-container.flipped .card-face--back {
  transform: rotateY(0deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--color-surface-3);
}

.flip-container {
  position: relative;
}

.card-face--front {
  background: white;
  transform: rotateY(0deg);
}

.card-face--back {
  background: var(--color-ink);
  color: var(--color-surface);
  transform: rotateY(180deg);
}

.card-face__inner {
  padding: var(--sp-8);
  text-align: center;
  width: 100%;
}

.card-face__hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: var(--sp-4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.answer-buttons {
  display: flex;
  gap: var(--sp-4);
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-10);
  border-radius: var(--radius-lg);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.answer-btn--wrong {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border: 2px solid var(--color-danger);
}

.answer-btn--wrong:hover {
  background: var(--color-danger);
  color: white;
  transform: translateY(-2px);
}

.answer-btn--correct {
  background: var(--color-success-light);
  color: var(--color-success);
  border: 2px solid var(--color-success);
}

.answer-btn--correct:hover {
  background: var(--color-success);
  color: white;
  transform: translateY(-2px);
}

.level-info {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.level-text {
  font-size: 0.85rem;
  color: var(--color-text-soft);
}

/* Transitions */
.answer-fade-enter-active {
  animation: fadeInUp var(--transition-base) both;
}

@media (max-width: 480px) {
  .answer-btn {
    padding: var(--sp-3) var(--sp-6);
    font-size: 0.9rem;
  }
}
</style>
