<template>
  <div class="theme-detail">
    <div class="container" v-if="result">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Fil d'Ariane">
        <router-link to="/categories">Catégories</router-link>
        <span aria-hidden="true"> / </span>
        <router-link :to="`/categories/${result.category.id}`">{{
          result.category.name
        }}</router-link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{{ result.theme.name }}</span>
      </nav>

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ result.theme.name }}</h1>
          <p v-if="result.theme.description" class="page-desc">{{ result.theme.description }}</p>
          <div class="theme-meta">
            <span>{{ result.theme.maxLevel }} niveaux</span>
            <span>•</span>
            <span>{{ result.theme.newCardsPerDay }} nouvelles cartes/jour</span>
            <span>•</span>
            <span>{{ dueCount }} à réviser aujourd'hui</span>
          </div>
        </div>
        <div class="page-header__actions">
          <router-link
            v-if="dueCount > 0"
            :to="`/review/${props.themeId}`"
            class="btn btn--primary"
          >
            ⚡ Réviser ({{ dueCount }})
          </router-link>
          <AppButton variant="ghost" @click="showEditTheme = true">⚙️ Configurer</AppButton>
          <AppButton variant="secondary" @click="showCreateCard = true">+ Nouvelle carte</AppButton>
        </div>
      </div>

      <!-- Progress -->
      <div class="progress-section">
        <div class="progress-header">
          <span>Progression</span>
          <span class="progress-pct">{{ progress }}%</span>
        </div>
        <ProgressBar :value="progress" :aria-label="`Progression: ${progress}%`" />

        <div class="level-dist" aria-label="Distribution par niveau">
          <div
            v-for="(count, level) in levelDistribution"
            :key="level"
            class="level-dist__item"
            :class="{ 'level-dist__item--due': dueLevels.includes(Number(level)) }"
            :title="
              dueLevels.includes(Number(level))
                ? `Niveau ${level} — à réviser aujourd\'hui`
                : `Niveau ${level}`
            "
          >
            <LevelBadge :level="Number(level)" :maxLevel="result.theme.maxLevel" />
            <span class="level-dist__count">{{ count }}</span>
            <span
              v-if="dueLevels.includes(Number(level))"
              class="level-dist__due-dot"
              aria-label="À réviser"
              >●</span
            >
          </div>
        </div>
        <p v-if="dueLevels.length > 0" class="level-dist__hint">
          ● Niveaux à réviser aujourd'hui :
          <strong>{{ dueLevels.map((l) => (l === 0 ? 'Nouv.' : `N${l}`)).join(', ') }}</strong>
        </p>
      </div>

      <!-- Search / filter -->
      <div class="list-header">
        <h2 class="list-title">
          Cartes
          <span class="list-count">{{ result.theme.cards.length }}</span>
        </h2>
        <div class="list-controls">
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Rechercher..."
            type="search"
            aria-label="Rechercher des cartes"
          />
        </div>
      </div>

      <div v-if="filteredCards.length === 0 && result.theme.cards.length === 0" class="empty-state">
        <span>🃏</span>
        <p>Aucune carte dans ce thème.</p>
        <AppButton variant="primary" @click="showCreateCard = true"
          >Créer ma première carte</AppButton
        >
      </div>

      <ul v-else class="cards-list" role="list">
        <li v-for="card in filteredCards" :key="card.id">
          <CardItem
            :card="card"
            :max-level="result.theme.maxLevel"
            @edit="editCard(card)"
            @delete="confirmDeleteCard(card)"
          />
        </li>
        <li v-if="filteredCards.length === 0 && searchQuery" class="no-results">
          Aucun résultat pour "{{ searchQuery }}"
        </li>
      </ul>
    </div>

    <div v-else class="container">
      <p>Thème introuvable.</p>
    </div>

    <!-- Modals -->
    <AppModal v-model="showCreateCard" title="Nouvelle carte">
      <CardForm submit-label="Créer" @submit="handleCreateCard" @cancel="showCreateCard = false" />
    </AppModal>

    <AppModal v-model="showEditCard" title="Modifier la carte">
      <CardForm
        :initial="editingCard || undefined"
        submit-label="Enregistrer"
        @submit="handleEditCard"
        @cancel="showEditCard = false"
      />
    </AppModal>

    <AppModal v-model="showEditTheme" title="Configurer le thème">
      <ThemeForm
        :initial="result?.theme"
        submit-label="Enregistrer"
        @submit="handleEditTheme"
        @cancel="showEditTheme = false"
      />
    </AppModal>

    <ConfirmDialog
      v-model="showDeleteCard"
      title="Supprimer la carte"
      message="Supprimer cette carte ? Cette action est irréversible."
      @confirm="handleDeleteCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMemoryStore } from '@/stores/memory'
import type { Card, CardSide, Theme } from '@/types'
import {
  getCardsDueTodayCount,
  getThemeProgress,
  getLevelDistribution,
  getDueLevelsToday,
} from '@/utils/spacedRepetition'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import LevelBadge from '@/components/ui/LevelBadge.vue'
import CardItem from '@/components/cards/CardItem.vue'
import CardForm from '@/components/cards/CardForm.vue'
import ThemeForm from '@/components/themes/ThemeForm.vue'

const props = defineProps<{ themeId: string }>()
const store = useMemoryStore()

const result = computed(() => store.getThemeById(props.themeId))
const progress = computed(() => (result.value ? getThemeProgress(result.value.theme) : 0))
const dueCount = computed(() => (result.value ? getCardsDueTodayCount(result.value.theme) : 0))
const levelDistribution = computed(() =>
  result.value ? getLevelDistribution(result.value.theme) : {},
)
const dueLevels = computed(() => (result.value ? getDueLevelsToday(result.value.theme) : []))

const searchQuery = ref('')
const filteredCards = computed(() => {
  if (!result.value) return []
  const q = searchQuery.value.toLowerCase()
  if (!q) return result.value.theme.cards
  return result.value.theme.cards.filter(
    (c) => c.front.text?.toLowerCase().includes(q) || c.back.text?.toLowerCase().includes(q),
  )
})

const showCreateCard = ref(false)
const showEditCard = ref(false)
const showDeleteCard = ref(false)
const showEditTheme = ref(false)
const editingCard = ref<Card | null>(null)
const deletingCard = ref<Card | null>(null)

function editCard(card: Card) {
  editingCard.value = card
  showEditCard.value = true
}

function confirmDeleteCard(card: Card) {
  deletingCard.value = card
  showDeleteCard.value = true
}

function handleCreateCard(data: { front: CardSide; back: CardSide }) {
  store.createCard(props.themeId, data)
  showCreateCard.value = false
}

function handleEditCard(data: { front: CardSide; back: CardSide }) {
  if (editingCard.value) {
    store.updateCard(editingCard.value.id, data)
  }
  showEditCard.value = false
}

function handleDeleteCard() {
  if (deletingCard.value) {
    store.deleteCard(deletingCard.value.id)
  }
}

function handleEditTheme(
  data: Pick<Theme, 'name' | 'description' | 'maxLevel' | 'newCardsPerDay'>,
) {
  store.updateTheme(props.themeId, data)
  showEditTheme.value = false
}
</script>

<style scoped>
.theme-detail {
  padding: var(--sp-8) 0 var(--sp-16);
}

.breadcrumb {
  font-size: 0.85rem;
  color: var(--color-text-soft);
  margin-bottom: var(--sp-6);
}

.breadcrumb a {
  color: var(--color-text-soft);
}

.breadcrumb a:hover {
  color: var(--color-accent);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-4);
  margin-bottom: var(--sp-8);
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  margin-bottom: var(--sp-2);
}

.page-desc {
  color: var(--color-text-soft);
  margin-bottom: var(--sp-3);
}

.theme-meta {
  display: flex;
  gap: var(--sp-3);
  font-size: 0.85rem;
  color: var(--color-text-soft);
  align-items: center;
}

.page-header__actions {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
  flex-wrap: wrap;
}

.progress-section {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--sp-6);
  margin-bottom: var(--sp-8);
  border: 2px solid var(--color-surface-3);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-3);
  font-weight: 600;
  font-family: var(--font-display);
}

.progress-pct {
  color: var(--color-accent);
  font-size: 1.2rem;
}

.level-dist {
  display: flex;
  gap: var(--sp-3);
  flex-wrap: wrap;
  margin-top: var(--sp-4);
}

.level-dist__item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.level-dist__count {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
}

.level-dist__item--due {
  background: var(--color-accent-light);
  border-radius: var(--radius-md);
  padding: 2px 6px;
  border: 1px solid var(--color-accent);
}

.level-dist__due-dot {
  font-size: 0.5rem;
  color: var(--color-accent);
  margin-left: 2px;
}

.level-dist__hint {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  margin-top: var(--sp-2);
}
.level-dist__hint strong {
  color: var(--color-accent);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  margin-bottom: var(--sp-5);
  flex-wrap: wrap;
}

.list-title {
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.list-count {
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  padding: 2px 10px;
  font-size: 0.85rem;
  font-weight: 600;
}

.search-input {
  padding: var(--sp-2) var(--sp-4);
  border: 2px solid var(--color-surface-3);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
  background: white;
  transition: border-color var(--transition-fast);
  min-width: 200px;
}

.search-input:focus {
  border-color: var(--color-accent);
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  list-style: none;
}

.no-results {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--sp-8);
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: var(--sp-12);
  background: white;
  border-radius: var(--radius-xl);
  border: 2px dashed var(--color-surface-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  font-size: 3rem;
}

.empty-state p {
  font-size: 1rem;
  color: var(--color-text-soft);
}
</style>
