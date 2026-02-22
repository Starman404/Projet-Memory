<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero container" aria-labelledby="hero-title">
      <div class="hero__left animate-fade-up">
        <p class="eyebrow">Répétition espacée</p>
        <h1 id="hero-title" class="hero__title">Mémorisez<br /><em>intelligemment</em></h1>
        <p class="hero__sub">
          Révisez au bon moment, retenez pour toujours. L'algorithme adapte vos révisions selon
          votre progression.
        </p>
        <div class="hero__actions">
          <router-link to="/categories" class="btn-accent">Explorer mes thèmes</router-link>
          <button class="btn-ghost" @click="showImport = true">📥 Données de test</button>
        </div>
      </div>

      <div class="hero__right animate-fade-up">
        <div class="panel">
          <div class="panel__head">
            <h2 class="panel__title">Vue d'ensemble</h2>
            <button
              v-if="store.cardsDueToday > 0"
              class="review-all-btn"
              @click="startGlobalReview"
            >
              ⚡ Tout réviser ({{ store.cardsDueToday }})
            </button>
          </div>

          <div class="stats-grid">
            <div class="stat">
              <span class="stat__val">{{ store.totalCards }}</span>
              <span class="stat__lbl">Cartes total</span>
            </div>
            <div class="stat">
              <span class="stat__val">{{ masteredCount }}</span>
              <span class="stat__lbl">Maîtrisées</span>
            </div>
            <div class="stat">
              <span class="stat__val">{{ activeCount }}</span>
              <span class="stat__lbl">En cours</span>
            </div>
            <div class="stat stat--accent">
              <span class="stat__val">{{ store.cardsDueToday }}</span>
              <span class="stat__lbl">À réviser</span>
            </div>
          </div>

          <!-- Explanation note -->
          <div v-if="store.totalCards > 0" class="info-note">
            <span class="info-note__icon">ℹ️</span>
            <span>
              <strong>{{ store.cardsDueToday }}</strong> cartes à réviser aujourd'hui (les
              <strong>{{ masteredCount }}</strong> cartes maîtrisées et les nouvelles cartes
              dépassant le quota quotidien ne sont pas comptées).
            </span>
          </div>

          <!-- Level distribution — always shows all 8 levels -->
          <div v-if="store.totalCards > 0" class="dist">
            <div class="dist__head">
              <p class="dist__label">Distribution par niveau</p>
              <p class="dist__today" v-if="globalDueLevels.length > 0">
                Niveaux révisés aujourd'hui :
                <span
                  v-for="lvl in globalDueLevels"
                  :key="lvl"
                  class="due-level-chip"
                  :class="`level-${lvl}`"
                  >{{ lvl === 0 ? 'Nv.' : lvl }}</span
                >
              </p>
            </div>
            <div class="dist__bars">
              <div
                v-for="lvl in [0, 1, 2, 3, 4, 5, 6, 7]"
                :key="lvl"
                class="bar"
                :class="{ 'bar--due': globalDueLevels.includes(lvl) }"
                :title="barTooltip(lvl)"
              >
                <div class="bar__track">
                  <div
                    class="bar__fill"
                    :class="`level-${lvl}`"
                    :style="{ height: barPct(globalDist[lvl] ?? 0) + '%' }"
                  />
                </div>
                <span class="bar__n">{{ globalDist[lvl] ?? 0 }}</span>
                <span class="bar__lbl">N{{ lvl }}</span>
              </div>
            </div>
          </div>
          <p v-else class="empty-hint">Ajoutez des cartes pour voir votre progression ici.</p>
        </div>
      </div>
    </section>

    <!-- Due today -->
    <section v-if="themesWithDue.length > 0" class="due container" aria-labelledby="due-title">
      <h2 id="due-title" class="section-title">Révisions du jour</h2>
      <ul class="due__list" role="list">
        <li v-for="{ theme, category } in themesWithDue" :key="theme.id" class="due__item">
          <span class="due__dot" :style="{ background: category.color }" />
          <div class="due__info">
            <span class="due__cat">{{ category.icon }} {{ category.name }}</span>
            <span class="due__theme">{{ theme.name }}</span>
            <div class="due__levels" v-if="getDueLevelsToday(theme).length > 0">
              <span
                v-for="lvl in getDueLevelsToday(theme)"
                :key="lvl"
                class="due-level-pill"
                :class="`level-${lvl}`"
                >{{ lvl === 0 ? 'Nouv.' : `N${lvl}` }}</span
              >
            </div>
          </div>
          <span class="due__count">{{ dueCount(theme) }}</span>
          <router-link :to="`/review/${theme.id}`" class="due__btn">Réviser →</router-link>
        </li>
      </ul>
    </section>

    <!-- Empty state -->
    <section v-else-if="store.categories.length === 0" class="empty-state container">
      <div class="empty-card animate-fade-up">
        <span class="empty-icon">🧠</span>
        <h2>Bienvenue sur Memory !</h2>
        <p>Créez une catégorie, ajoutez des thèmes et des cartes, puis commencez à réviser.</p>
        <router-link to="/categories" class="btn-accent">Commencer</router-link>
      </div>
    </section>

    <!-- Global review modal -->
    <AppModal v-model="showGlobalReview" title="Révision globale">
      <p class="modal-hint">Sélectionnez les thèmes à réviser ensemble :</p>
      <ul class="pick-list" role="list">
        <li v-for="{ theme, category } in allThemesWithDue" :key="theme.id">
          <label class="pick-item">
            <input type="checkbox" :value="theme.id" v-model="selectedIds" class="pick-check" />
            <span class="pick-dot" :style="{ background: category.color }" />
            <span class="pick-name">{{ category.icon }} {{ theme.name }}</span>
            <span class="pick-count">{{ dueCount(theme) }}</span>
          </label>
        </li>
      </ul>
      <template #footer>
        <button class="modal-btn-ghost" @click="showGlobalReview = false">Annuler</button>
        <button class="modal-btn-accent" :disabled="selectedIds.length === 0" @click="launchGlobal">
          Réviser ({{ totalSelectedDue }} cartes)
        </button>
      </template>
    </AppModal>

    <GlobalReviewSession
      v-if="globalSession"
      :session-cards="globalSession"
      @done="globalSession = null"
    />

    <!-- Import modal -->
    <AppModal v-model="showImport" title="Importer des données de test">
      <p class="modal-hint">
        Cela fusionnera les données de démonstration avec vos données actuelles.
      </p>
      <template #footer>
        <button class="modal-btn-ghost" @click="showImport = false">Annuler</button>
        <button class="modal-btn-accent" @click="doImport">Importer</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMemoryStore } from '@/stores/memory'
import {
  getCardsDueTodayCount,
  getCardsForTodayReview,
  getGlobalLevelDistribution,
  getDueLevelsToday,
} from '@/utils/spacedRepetition'
import type { Theme, Card } from '@/types'
import AppModal from '@/components/ui/AppModal.vue'
import GlobalReviewSession from '@/components/review/GlobalReviewSession.vue'
import { testData } from '@/data/testData'

const store = useMemoryStore()
const showImport = ref(false)
const showGlobalReview = ref(false)
const selectedIds = ref<string[]>([])
const globalSession = ref<Card[] | null>(null)

const masteredCount = computed(() =>
  store.categories.reduce(
    (t, cat) =>
      t +
      cat.themes.reduce(
        (tt, theme) => tt + theme.cards.filter((c) => c.level >= theme.maxLevel).length,
        0,
      ),
    0,
  ),
)
const activeCount = computed(() => store.totalCards - masteredCount.value)

const allThemesWithDue = computed(() => {
  const out: { theme: Theme; category: (typeof store.categories)[0] }[] = []
  for (const cat of store.categories)
    for (const theme of cat.themes)
      if (getCardsDueTodayCount(theme) > 0) out.push({ theme, category: cat })
  return out
})
const themesWithDue = allThemesWithDue

function dueCount(theme: Theme) {
  return getCardsDueTodayCount(theme)
}

const globalDist = computed(() => getGlobalLevelDistribution(store.categories))
const maxCount = computed(() => Math.max(...Object.values(globalDist.value), 1))
function barPct(n: number) {
  return n === 0 ? 0 : Math.max(5, Math.round((n / maxCount.value) * 100))
}

const globalDueLevels = computed(() => {
  const levels = new Set<number>()
  for (const cat of store.categories)
    for (const theme of cat.themes) for (const lvl of getDueLevelsToday(theme)) levels.add(lvl)
  return [...levels].sort((a, b) => a - b)
})

function barTooltip(lvl: number): string {
  const n = globalDist.value[lvl] ?? 0
  const isDue = globalDueLevels.value.includes(lvl)
  const label = lvl === 0 ? 'Non introduites' : lvl === 7 ? 'Maîtrisées' : `Niveau ${lvl}`
  return `${label} : ${n} carte${n !== 1 ? 's' : ''}${isDue ? " ← à réviser aujourd'hui" : ''}`
}

const totalSelectedDue = computed(() =>
  selectedIds.value.reduce(
    (s, id) => s + (store.getThemeById(id) ? dueCount(store.getThemeById(id)!.theme) : 0),
    0,
  ),
)

function startGlobalReview() {
  selectedIds.value = allThemesWithDue.value.map(({ theme }) => theme.id)
  showGlobalReview.value = true
}
function launchGlobal() {
  const cards: Card[] = []
  for (const id of selectedIds.value) {
    const r = store.getThemeById(id)
    if (r) cards.push(...getCardsForTodayReview(r.theme))
  }
  globalSession.value = cards
  showGlobalReview.value = false
}
function doImport() {
  store.mergeImportedCategories(testData)
  showImport.value = false
}
</script>

<style scoped>
.home {
  padding-bottom: var(--sp-16);
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-12);
  align-items: start;
  padding-top: var(--sp-12);
  padding-bottom: var(--sp-12);
}
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
}

.eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-accent);
  font-weight: 800;
  margin-bottom: var(--sp-3);
}
.hero__title {
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  line-height: 1.05;
  margin-bottom: var(--sp-4);
}
.hero__title em {
  font-style: italic;
  color: var(--color-accent);
}
.hero__sub {
  font-size: 0.95rem;
  color: var(--color-text-soft);
  line-height: 1.8;
  margin-bottom: var(--sp-8);
  max-width: 400px;
}
.hero__actions {
  display: flex;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--sp-6);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}
.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
}
.panel__title {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}
.review-all-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition: all var(--transition-fast);
  animation: pulse 2.5s infinite;
  white-space: nowrap;
}
.review-all-btn:hover {
  background: var(--color-accent-hover);
  transform: scale(1.03);
  animation: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-2);
}
.stat {
  background: var(--color-surface-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-3);
  text-align: center;
}
.stat--accent {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
}
.stat__val {
  display: block;
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1;
  margin-bottom: 2px;
}
.stat--accent .stat__val {
  color: var(--color-accent);
}
.stat__lbl {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.info-note {
  display: flex;
  gap: var(--sp-2);
  align-items: flex-start;
  font-size: 0.78rem;
  color: var(--color-text-soft);
  line-height: 1.5;
  background: var(--color-accent-light);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: var(--sp-3);
}
.info-note__icon {
  flex-shrink: 0;
}

/* Distribution bars */
.dist__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
}
.dist__label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 700;
  font-family: var(--font-body);
}
.dist__today {
  font-size: 0.68rem;
  color: var(--color-text-soft);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.due-level-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  border-radius: var(--radius-full);
  font-size: 9px;
  font-weight: 800;
  color: #fff;
  padding: 0 5px;
}
.due-level-chip.level-0 {
  color: var(--color-text-soft);
}
.due-level-chip.level-3,
.due-level-chip.level-4,
.due-level-chip.level-5 {
  color: var(--color-text);
}

.dist__bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 72px;
  margin-top: var(--sp-3);
}
.bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  height: 100%;
  position: relative;
}
.bar--due::after {
  content: '▲';
  position: absolute;
  bottom: -14px;
  font-size: 7px;
  color: var(--color-accent);
}
.bar__track {
  flex: 1;
  width: 100%;
  background: var(--color-surface-3);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.bar--due .bar__track {
  outline: 1.5px solid var(--color-accent);
  border-radius: var(--radius-sm);
}
.bar__fill {
  width: 100%;
  transition: height var(--transition-slow);
  min-height: 0;
}
.bar__n {
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--color-text-soft);
  line-height: 1;
}
.bar__lbl {
  font-size: 0.52rem;
  color: var(--color-text-muted);
  font-weight: 700;
}

.empty-hint {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  text-align: center;
}

/* Due list */
.due {
  margin-bottom: var(--sp-8);
}
.section-title {
  font-size: 1.3rem;
  margin-bottom: var(--sp-4);
}
.due__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.due__item {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition-fast);
}
.due__item:hover {
  border-color: var(--color-accent);
}
.due__dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}
.due__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.due__cat {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}
.due__theme {
  font-weight: 700;
  font-size: 0.92rem;
}
.due__levels {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.due-level-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-size: 0.62rem;
  font-weight: 800;
  color: #fff;
}
.due-level-pill.level-0 {
  color: var(--color-text-soft);
}
.due-level-pill.level-3,
.due-level-pill.level-4,
.due-level-pill.level-5 {
  color: var(--color-text);
}
.due__count {
  font-size: 0.88rem;
  color: var(--color-accent);
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
  background: var(--color-accent-light);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}
.due__btn {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text-soft);
  padding: var(--sp-2) var(--sp-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  white-space: nowrap;
  text-decoration: none;
  flex-shrink: 0;
}
.due__btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}

/* Empty state */
.empty-state {
  display: flex;
  justify-content: center;
  padding: var(--sp-16) 0;
}
.empty-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--sp-12) var(--sp-16);
  box-shadow: var(--shadow-md);
  text-align: center;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
}
.empty-icon {
  font-size: 3.5rem;
}
.empty-card h2 {
  font-size: 1.5rem;
}
.empty-card p {
  font-size: 0.88rem;
  color: var(--color-text-soft);
  line-height: 1.7;
}

/* Buttons */
.btn-accent {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-3) var(--sp-8);
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 0.92rem;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all var(--transition-fast);
  text-decoration: none;
}
.btn-accent:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-accent);
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-3) var(--sp-6);
  background: transparent;
  color: var(--color-text-soft);
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 0.92rem;
  border: 1.5px solid var(--color-border);
  cursor: pointer;
  font-family: var(--font-body);
  transition: all var(--transition-fast);
}
.btn-ghost:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}

/* Modal */
.modal-hint {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  margin-bottom: var(--sp-4);
}
.pick-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.pick-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}
.pick-item:hover {
  border-color: var(--color-accent);
}
.pick-check {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
}
.pick-dot {
  width: 9px;
  height: 9px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}
.pick-name {
  flex: 1;
  font-weight: 600;
  font-size: 0.88rem;
}
.pick-count {
  background: var(--color-accent-light);
  color: var(--color-accent);
  padding: 2px var(--sp-3);
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 800;
}
.modal-btn-ghost {
  padding: var(--sp-2) var(--sp-5);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-soft);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.modal-btn-ghost:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.modal-btn-accent {
  padding: var(--sp-2) var(--sp-6);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-accent);
  color: #fff;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.modal-btn-accent:hover {
  background: var(--color-accent-hover);
}
.modal-btn-accent:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
