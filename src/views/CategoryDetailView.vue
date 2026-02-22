<template>
  <div class="category-detail">
    <div class="container" v-if="category">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Fil d'Ariane">
        <router-link to="/categories">Catégories</router-link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{{ category.name }}</span>
      </nav>

      <!-- Header -->
      <div class="page-header">
        <div class="page-header__info">
          <div class="cat-icon" aria-hidden="true">{{ category.icon || '📚' }}</div>
          <div>
            <h1 class="page-title" :style="{ color: category.color }">{{ category.name }}</h1>
            <p v-if="category.description" class="page-desc">{{ category.description }}</p>
          </div>
        </div>
        <div class="page-header__actions">
          <AppButton variant="ghost" icon="✏️" @click="showEditCategory = true">Modifier</AppButton>
          <AppButton variant="primary" @click="showCreateTheme = true">+ Nouveau thème</AppButton>
        </div>
      </div>

      <!-- Themes -->
      <div v-if="category.themes.length === 0" class="empty-state">
        <span aria-hidden="true">📖</span>
        <p>Aucun thème dans cette catégorie.</p>
        <AppButton variant="primary" @click="showCreateTheme = true">Créer un thème</AppButton>
      </div>

      <ul v-else class="themes-grid" role="list">
        <li v-for="theme in category.themes" :key="theme.id">
          <ThemeCard
            :theme="theme"
            @edit="editTheme(theme)"
            @delete="confirmDeleteTheme(theme)"
            @review="() => router.push(`/review/${theme.id}`)"
          />
        </li>
      </ul>
    </div>

    <div v-else class="container">
      <p>Catégorie introuvable.</p>
      <router-link to="/categories">← Retour aux catégories</router-link>
    </div>

    <!-- Edit category modal -->
    <AppModal v-model="showEditCategory" title="Modifier la catégorie">
      <CategoryForm
        :initial="category"
        submit-label="Enregistrer"
        @submit="handleEditCategory"
        @cancel="showEditCategory = false"
      />
    </AppModal>

    <!-- Create theme modal -->
    <AppModal v-model="showCreateTheme" title="Nouveau thème">
      <ThemeForm
        submit-label="Créer"
        @submit="handleCreateTheme"
        @cancel="showCreateTheme = false"
      />
    </AppModal>

    <!-- Edit theme modal -->
    <AppModal v-model="showEditTheme" title="Modifier le thème">
      <ThemeForm
        :initial="editingTheme"
        submit-label="Enregistrer"
        @submit="handleEditTheme"
        @cancel="showEditTheme = false"
      />
    </AppModal>

    <!-- Confirm delete theme -->
    <ConfirmDialog
      v-model="showDeleteTheme"
      title="Supprimer le thème"
      :message="`Supprimer « ${deletingTheme?.name} » et toutes ses cartes ?`"
      @confirm="handleDeleteTheme"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMemoryStore } from '@/stores/memory'
import type { Theme, Category } from '@/types'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import CategoryForm from '@/components/categories/CategoryForm.vue'
import ThemeCard from '@/components/themes/ThemeCard.vue'
import ThemeForm from '@/components/themes/ThemeForm.vue'

const props = defineProps<{ categoryId: string }>()
const router = useRouter()
const store = useMemoryStore()

const category = computed(() => store.getCategoryById(props.categoryId))

const showEditCategory = ref(false)
const showCreateTheme = ref(false)
const showEditTheme = ref(false)
const showDeleteTheme = ref(false)
const editingTheme = ref<Theme | null>(null)
const deletingTheme = ref<Theme | null>(null)

function editTheme(theme: Theme) {
  editingTheme.value = theme
  showEditTheme.value = true
}

function confirmDeleteTheme(theme: Theme) {
  deletingTheme.value = theme
  showDeleteTheme.value = true
}

function handleEditCategory(data: Pick<Category, 'name' | 'description' | 'color' | 'icon'>) {
  store.updateCategory(props.categoryId, data)
  showEditCategory.value = false
}

function handleCreateTheme(
  data: Pick<Theme, 'name' | 'description' | 'maxLevel' | 'newCardsPerDay'>,
) {
  store.createTheme(props.categoryId, data)
  showCreateTheme.value = false
}

function handleEditTheme(
  data: Pick<Theme, 'name' | 'description' | 'maxLevel' | 'newCardsPerDay'>,
) {
  if (editingTheme.value) {
    store.updateTheme(editingTheme.value.id, data)
  }
  showEditTheme.value = false
}

function handleDeleteTheme() {
  if (deletingTheme.value) {
    store.deleteTheme(deletingTheme.value.id)
  }
}
</script>

<style scoped>
.category-detail {
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

.page-header__info {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}

.cat-icon {
  font-size: 3rem;
  line-height: 1;
}

.page-title {
  font-size: 2rem;
  margin-bottom: var(--sp-1);
}

.page-desc {
  color: var(--color-text-soft);
  font-size: 0.95rem;
}

.page-header__actions {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--sp-5);
  list-style: none;
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
