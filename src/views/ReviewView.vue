<template>
  <div class="review-view">
    <div class="container" v-if="result">

      <!-- Header -->
      <div class="rh">
        <router-link :to="`/themes/${props.themeId}`" class="back-link">
          ← {{ result.theme.name }}
        </router-link>
        <div class="progress-row" role="status" :aria-label="`Carte ${currentIndex + 1} sur ${queue.length}`">
          <span class="prog-text">{{ currentIndex + 1 }} / {{ queue.length }}</span>
          <div class="prog-track">
            <div class="prog-fill" :style="{ width: sessionProgress + '%' }" />
          </div>
        </div>
        <div class="session-stats" aria-live="polite">
          <span class="s-ok">✓ {{ stats.correct }}</span>
          <span class="s-ko">✗ {{ stats.incorrect }}</span>
        </div>
      </div>

      <!-- Active card -->
      <main class="review-main" v-if="currentCard" aria-label="Carte de révision">

        <div
          class="flip-wrap"
          :class="{ flipped: isFlipped }"
          role="button"
          tabindex="0"
          :aria-label="isFlipped ? 'Verso affiché' : 'Cliquez pour révéler le verso'"
          @click="flip"
          @keydown.space.prevent="flip"
          @keydown.enter.prevent="flip"
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
          <span class="level-badge" :class="`level-${currentCard.level}`">{{ currentCard.level }}</span>
          <span class="meta-text">{{ levelLabel(currentCard) }}</span>
          <span v-if="isRequeued" class="requeue-tag">🔄 Reprise</span>
        </div>

        <transition name="answer-fade">
          <div v-if="isFlipped" class="answer-btns" role="group" aria-label="Votre réponse">
            <button class="ans-btn ans-btn--wrong" @click="answer(false)">
              <span aria-hidden="true">✗</span> Incorrect
            </button>
            <button class="ans-btn ans-btn--correct" @click="answer(true)">
              <span aria-hidden="true">✓</span> Correct
            </button>
          </div>
        </transition>

        <p class="kbd-hint" aria-hidden="true">
          <kbd>Espace</kbd> / <kbd>Entrée</kbd> pour révéler
        </p>
      </main>

      <!-- Session complete -->
      <div v-else class="done animate-fade-up" role="status">
        <span class="done__icon">🎉</span>
        <h2 class="done__title">Session terminée !</h2>
        <div class="done__stats">
          <div class="done__stat">
            <span class="done__val done__val--ok">{{ stats.correct }}</span>
            <span class="done__lbl">Correctes</span>
          </div>
          <div class="done__stat">
            <span class="done__val done__val--ko">{{ stats.incorrect }}</span>
            <span class="done__lbl">Incorrectes</span>
          </div>
          <div class="done__stat">
            <span class="done__val">{{ accuracy }}%</span>
            <span class="done__lbl">Précision</span>
          </div>
        </div>
        <div class="done__actions">
          <router-link :to="`/themes/${props.themeId}`" class="link-ghost">Voir le thème</router-link>
          <router-link to="/" class="link-accent">Accueil</router-link>
        </div>
      </div>

    </div>
    <div v-else class="container" style="padding-top:var(--sp-10)">
      <p style="color:var(--color-text-soft)">Thème introuvable.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMemoryStore } from '@/stores/memory'
import {
  getCardsForTodayReview,
  processCorrectAnswer,
  processWrongAnswer,
  getIntervalForLevel
} from '@/utils/spacedRepetition'
import type { Card } from '@/types'
import CardContent from '@/components/review/CardContent.vue'

const props = defineProps<{ themeId: string }>()
const store = useMemoryStore()

const result = computed(() => store.getThemeById(props.themeId))

const queue        = ref<Card[]>([])
const requeuedIds  = ref(new Set<string>())
const currentIndex = ref(0)
const isFlipped    = ref(false)
const stats        = ref({ correct: 0, incorrect: 0 })

onMounted(() => {
  if (result.value) queue.value = getCardsForTodayReview(result.value.theme)
})

const currentCard  = computed((): Card | null => queue.value[currentIndex.value] ?? null)
const isRequeued   = computed(() => currentCard.value ? requeuedIds.value.has(currentCard.value.id) : false)

const sessionProgress = computed(() => {
  if (queue.value.length === 0) return 100
  return Math.round((currentIndex.value / queue.value.length) * 100)
})

const accuracy = computed(() => {
  const t = stats.value.correct + stats.value.incorrect
  return t === 0 ? 0 : Math.round((stats.value.correct / t) * 100)
})

function levelLabel(card: Card): string {
  if (!result.value) return ''
  if (card.level === 0) return 'Nouvelle carte'
  if (card.level >= result.value.theme.maxLevel) return 'Maîtrisée !'
  const i = getIntervalForLevel(card.level)
  return `N${card.level} · tous les ${i} jour${i > 1 ? 's' : ''}`
}

function flip() { if (!isFlipped.value) isFlipped.value = true }

function answer(correct: boolean) {
  const card = currentCard.value
  if (!card || !result.value) return

  if (correct) {
    stats.value.correct++
    const u = processCorrectAnswer(card, result.value.theme.maxLevel)
    store.updateCard(card.id, { level: u.level, lastReviewed: u.lastReviewed, nextReview: u.nextReview })
  } else {
    stats.value.incorrect++
    const u = processWrongAnswer(card)
    store.updateCard(card.id, { level: u.level, lastReviewed: u.lastReviewed, nextReview: u.nextReview })
    // Re-append to end of queue so we review it again before finishing
    requeuedIds.value.add(card.id)
    queue.value.push({ ...card, level: 1 })
  }

  currentIndex.value++
  isFlipped.value = false
}
</script>

<style scoped>
.review-view {
  padding: var(--sp-8) 0 var(--sp-16);
  min-height: calc(100vh - 60px);
}

/* Header row */
.rh {
  display: flex;
  align-items: center;
  gap: var(--sp-6);
  margin-bottom: var(--sp-10);
  flex-wrap: wrap;
}

.back-link {
  font-weight: 700; font-size: 0.875rem;
  color: var(--color-text-soft);
  transition: color var(--transition-fast);
  white-space: nowrap; text-decoration: none;
}
.back-link:hover { color: var(--color-accent); }

.progress-row {
  flex: 1; display: flex; align-items: center;
  gap: var(--sp-4); min-width: 180px;
}

.prog-text { font-size: 0.82rem; font-weight: 700; color: var(--color-text-soft); white-space: nowrap; }

.prog-track {
  flex: 1; height: 7px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full); overflow: hidden;
}
.prog-fill {
  height: 100%; background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.session-stats { display: flex; gap: var(--sp-4); font-weight: 800; font-size: 0.9rem; }
.s-ok { color: var(--color-success); }
.s-ko { color: var(--color-danger); }

/* Card area */
.review-main {
  display: flex; flex-direction: column; align-items: center; gap: var(--sp-6);
}

.flip-wrap {
  width: 100%; max-width: 640px;
  aspect-ratio: 5/3;
  perspective: 1200px;
  cursor: pointer; position: relative;
}

.face {
  position: absolute; inset: 0;
  backface-visibility: hidden;
  border-radius: var(--radius-2xl);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: var(--sp-8);
  transition: transform 0.55s cubic-bezier(0.4,0,0.2,1);
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

.flip-wrap.flipped .face--front { transform: rotateY(-180deg); }
.flip-wrap.flipped .face--back  { transform: rotateY(0deg); }

.face__hint {
  position: absolute; top: var(--sp-4);
  font-size: 0.65rem; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.1em;
}

.card-meta { display: flex; align-items: center; gap: var(--sp-3); }
.meta-text { font-size: 0.82rem; color: var(--color-text-soft); font-weight: 600; }

.requeue-tag {
  font-size: 0.72rem;
  background: var(--color-warning-light);
  color: var(--color-warning);
  padding: 2px var(--sp-3);
  border-radius: var(--radius-full);
  font-weight: 800;
}

/* Answer buttons */
.answer-btns { display: flex; gap: var(--sp-4); }

.ans-btn {
  display: flex; align-items: center; gap: var(--sp-2);
  padding: var(--sp-4) var(--sp-10);
  border-radius: var(--radius-xl);
  font-family: var(--font-body); font-weight: 700; font-size: 1rem;
  cursor: pointer; transition: all var(--transition-fast);
  border: 2px solid;
}

.ans-btn--wrong {
  background: var(--color-danger-light); color: var(--color-danger);
  border-color: var(--color-danger);
}
.ans-btn--wrong:hover {
  background: var(--color-danger); color: #fff;
  transform: translateY(-2px); box-shadow: 0 4px 14px rgba(220,38,38,0.25);
}

.ans-btn--correct {
  background: var(--color-success-light); color: var(--color-success);
  border-color: var(--color-success);
}
.ans-btn--correct:hover {
  background: var(--color-success); color: #fff;
  transform: translateY(-2px); box-shadow: 0 4px 14px rgba(21,128,61,0.25);
}

.kbd-hint { font-size: 0.72rem; color: var(--color-text-muted); }
kbd {
  background: var(--color-surface-3); border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); padding: 1px 6px; font-size: 0.72rem;
}

/* Session done */
.done {
  max-width: 480px; margin: 0 auto; text-align: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--sp-12) var(--sp-16);
  box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column; align-items: center; gap: var(--sp-8);
}

.done__icon { font-size: 4rem; animation: pulse 1s 3; }
.done__title { font-size: 2rem; }
.done__stats { display: flex; gap: var(--sp-8); }
.done__stat { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); }

.done__val { font-family: var(--font-display); font-size: 2.5rem; line-height: 1; }
.done__val--ok { color: var(--color-success); }
.done__val--ko { color: var(--color-danger); }

.done__lbl {
  font-size: 0.7rem; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;
}

.done__actions { display: flex; gap: var(--sp-4); }

.link-accent {
  padding: var(--sp-3) var(--sp-8);
  background: var(--color-accent); color: #fff;
  border-radius: var(--radius-lg); font-weight: 700;
  text-decoration: none; transition: all var(--transition-fast);
}
.link-accent:hover { background: var(--color-accent-hover); transform: translateY(-1px); }

.link-ghost {
  padding: var(--sp-3) var(--sp-8);
  border: 1.5px solid var(--color-border); color: var(--color-text-soft);
  border-radius: var(--radius-lg); font-weight: 700;
  text-decoration: none; transition: all var(--transition-fast);
}
.link-ghost:hover { border-color: var(--color-accent); color: var(--color-accent); }

.answer-fade-enter-active { animation: fadeInUp 0.2s both; }

@media (max-width: 480px) {
  .ans-btn { padding: var(--sp-3) var(--sp-6); font-size: 0.9rem; }
  .flip-wrap { aspect-ratio: 4/3; }
}
</style>