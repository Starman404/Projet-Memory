<template>
  <div class="overlay" @click.self="$emit('done')">
    <div class="panel">
      <!-- Header -->
      <div class="panel__head">
        <h2 class="panel__title">Révision globale</h2>
        <div class="prog-row" role="status">
          <span class="prog-text">{{ currentIndex + 1 }} / {{ queue.length }}</span>
          <div class="prog-track"><div class="prog-fill" :style="{ width: progress + '%' }" /></div>
        </div>
        <div class="stats-row">
          <span class="s-ok">✓ {{ stats.correct }}</span>
          <span class="s-ko">✗ {{ stats.incorrect }}</span>
        </div>
        <button class="close-btn" @click="$emit('done')" aria-label="Fermer">✕</button>
      </div>

      <!-- Active card -->
      <div class="panel__body" v-if="currentCard">
        <div
          class="flip-wrap"
          :class="{ flipped: isFlipped }"
          role="button"
          tabindex="0"
          @click="flip"
          @keydown.space.prevent="flip"
          @keydown.enter.prevent="flip"
          :aria-label="isFlipped ? 'Verso affiché' : 'Cliquez pour révéler'"
        >
          <div class="face face--front">
            <p class="face__hint">Cliquez pour révéler</p>
            <CardContent :side="currentCard.front" />
          </div>
          <div class="face face--back">
            <CardContent :side="currentCard.back" />
          </div>
        </div>

        <div class="card-meta" aria-live="polite">
          <span class="level-badge" :class="`level-${currentCard.level}`">{{
            currentCard.level
          }}</span>
          <span class="meta-text">{{ levelLabel }}</span>
          <span v-if="isRequeued" class="requeue-tag">🔄 Reprise</span>
        </div>

        <transition name="af">
          <div v-if="isFlipped" class="answer-btns" role="group">
            <button class="ans-btn ans-btn--wrong" @click="answer(false)">✗ Incorrect</button>
            <button class="ans-btn ans-btn--correct" @click="answer(true)">✓ Correct</button>
          </div>
        </transition>
      </div>

      <!-- Done -->
      <div v-else class="done">
        <span class="done__icon">🎉</span>
        <h3 class="done__title">Session terminée !</h3>
        <div class="done__stats">
          <span class="ok-text">✓ {{ stats.correct }} correctes</span>
          <span class="ko-text">✗ {{ stats.incorrect }} incorrectes</span>
          <span>{{ accuracy }}% de précision</span>
        </div>
        <button class="done-btn" @click="$emit('done')">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card } from '@/types'
import { useMemoryStore } from '@/stores/memory'
import {
  processCorrectAnswer,
  processWrongAnswer,
  getIntervalForLevel,
} from '@/utils/spacedRepetition'
import CardContent from './CardContent.vue'

const props = defineProps<{ sessionCards: Card[] }>()
const store = useMemoryStore()

const queue = ref<Card[]>([...props.sessionCards])
const requeuedIds = ref(new Set<string>())
const currentIndex = ref(0)
const isFlipped = ref(false)
const stats = ref({ correct: 0, incorrect: 0 })

const currentCard = computed((): Card | null => queue.value[currentIndex.value] ?? null)
const isRequeued = computed(() =>
  currentCard.value ? requeuedIds.value.has(currentCard.value.id) : false,
)

const progress = computed(() =>
  queue.value.length === 0 ? 100 : Math.round((currentIndex.value / queue.value.length) * 100),
)

const accuracy = computed(() => {
  const t = stats.value.correct + stats.value.incorrect
  return t === 0 ? 0 : Math.round((stats.value.correct / t) * 100)
})

const levelLabel = computed(() => {
  const card = currentCard.value
  if (!card) return ''
  if (card.level === 0) return 'Nouvelle carte'
  const i = getIntervalForLevel(card.level)
  return `N${card.level} · tous les ${i} jour${i > 1 ? 's' : ''}`
})

function flip() {
  if (!isFlipped.value) isFlipped.value = true
}

function answer(correct: boolean) {
  const card = currentCard.value
  if (!card) return
  const r = store.getThemeById(card.themeId)
  const maxLevel = r?.theme.maxLevel ?? 7

  if (correct) {
    stats.value.correct++
    const u = processCorrectAnswer(card, maxLevel)
    store.updateCard(card.id, {
      level: u.level,
      lastReviewed: u.lastReviewed,
      nextReview: u.nextReview,
    })
  } else {
    stats.value.incorrect++
    const u = processWrongAnswer(card)
    store.updateCard(card.id, {
      level: u.level,
      lastReviewed: u.lastReviewed,
      nextReview: u.nextReview,
    })
    requeuedIds.value.add(card.id)
    queue.value.push({ ...card, level: 1 })
  }

  currentIndex.value++
  isFlipped.value = false
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(26, 23, 20, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-4);
}

.panel {
  position: relative;
  width: 100%;
  max-width: 680px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: fadeInUp 0.3s both;
}

.panel__head {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-6);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.panel__title {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 800;
  flex-shrink: 0;
}

.prog-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  min-width: 100px;
}
.prog-text {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-soft);
  white-space: nowrap;
}
.prog-track {
  flex: 1;
  height: 5px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.prog-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.stats-row {
  display: flex;
  gap: var(--sp-3);
  font-size: 0.82rem;
  font-weight: 800;
}
.s-ok {
  color: var(--color-success);
}
.s-ko {
  color: var(--color-danger);
}

.close-btn {
  color: var(--color-text-muted);
  padding: var(--sp-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  font-size: 0.9rem;
}
.close-btn:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

/* Body */
.panel__body {
  padding: var(--sp-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-5);
}

.flip-wrap {
  width: 100%;
  max-width: 540px;
  aspect-ratio: 5/3;
  perspective: 1000px;
  position: relative;
  cursor: pointer;
}

.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-6);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid var(--color-border);
}

.face--front {
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  transform: rotateY(0deg);
}
.face--back {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-accent);
  transform: rotateY(180deg);
}

.flip-wrap.flipped .face--front {
  transform: rotateY(-180deg);
}
.flip-wrap.flipped .face--back {
  transform: rotateY(0deg);
}

.face__hint {
  position: absolute;
  top: var(--sp-3);
  font-size: 0.62rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.meta-text {
  font-size: 0.78rem;
  color: var(--color-text-soft);
  font-weight: 600;
}

.requeue-tag {
  font-size: 0.68rem;
  background: var(--color-warning-light);
  color: var(--color-warning);
  padding: 2px var(--sp-2);
  border-radius: var(--radius-full);
  font-weight: 800;
}

.answer-btns {
  display: flex;
  gap: var(--sp-4);
}

.ans-btn {
  padding: var(--sp-3) var(--sp-8);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 2px solid;
}

.ans-btn--wrong {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}
.ans-btn--wrong:hover {
  background: var(--color-danger);
  color: #fff;
  transform: translateY(-2px);
}

.ans-btn--correct {
  background: var(--color-success-light);
  color: var(--color-success);
  border-color: var(--color-success);
}
.ans-btn--correct:hover {
  background: var(--color-success);
  color: #fff;
  transform: translateY(-2px);
}

/* Done */
.done {
  padding: var(--sp-10) var(--sp-8);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-5);
}

.done__icon {
  font-size: 3rem;
  animation: pulse 1s 3;
}
.done__title {
  font-size: 1.6rem;
}

.done__stats {
  display: flex;
  gap: var(--sp-5);
  font-weight: 700;
  font-size: 0.88rem;
  flex-wrap: wrap;
  justify-content: center;
}
.ok-text {
  color: var(--color-success);
}
.ko-text {
  color: var(--color-danger);
}

.done-btn {
  padding: var(--sp-3) var(--sp-8);
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  border: none;
  transition: background var(--transition-fast);
}
.done-btn:hover {
  background: var(--color-accent-hover);
}

.af-enter-active {
  animation: fadeInUp 0.2s both;
}

@media (max-width: 480px) {
  .ans-btn {
    padding: var(--sp-3) var(--sp-5);
  }
  .flip-wrap {
    aspect-ratio: 4/3;
  }
}
</style>
