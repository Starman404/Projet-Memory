<template>
  <div class="categories-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Catégories</h1>
        <AppButton variant="primary" icon="+" @click="showCreate = true">
          Nouvelle catégorie
        </AppButton>
      </div>

      <div v-if="store.categories.length === 0" class="empty-state animate-fade-up">
        <span class="empty-icon" aria-hidden="true">📚</span>
        <p>Aucune catégorie pour l'instant.</p>
        <AppButton variant="primary" @click="showCreate = true"
          >Créer ma première catégorie</AppButton
        >
      </div>

      <ul v-else class="categories-grid" role="list">
        <li v-for="cat in store.categories" :key="cat.id" class="animate-fade-up">
          <CategoryCard :category="cat" @edit="editCategory(cat)" @delete="confirmDelete(cat)" />
        </li>
      </ul>
    </div>

    <!-- Create modal -->
    <AppModal v-model="showCreate" title="Nouvelle catégorie">
      <CategoryForm submit-label="Créer" @submit="handleCreate" @cancel="showCreate = false" />
    </AppModal>

    <!-- Edit modal -->
    <AppModal v-model="showEdit" title="Modifier la catégorie">
      <CategoryForm
        :initial="editingCategory"
        submit-label="Enregistrer"
        @submit="handleEdit"
        @cancel="showEdit = false"
      />
    </AppModal>

    <!-- Confirm delete -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Supprimer la catégorie"
      :message="`Supprimer « ${deletingCategory?.name} » et tous ses thèmes et cartes ? Cette action est irréversible.`"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMemoryStore } from '@/stores/memory'
import type { Category } from '@/types'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import CategoryCard from '@/components/categories/CategoryCard.vue'
import CategoryForm from '@/components/categories/CategoryForm.vue'

const store = useMemoryStore()

const showCreate = ref(false)
const showEdit = ref(false)
const showDeleteConfirm = ref(false)

const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<Category | null>(null)

function editCategory(cat: Category) {
  editingCategory.value = cat
  showEdit.value = true
}

function confirmDelete(cat: Category) {
  deletingCategory.value = cat
  showDeleteConfirm.value = true
}

function handleCreate(data: Pick<Category, 'name' | 'description' | 'color' | 'icon'>) {
  store.createCategory(data)
  showCreate.value = false
}

function handleEdit(data: Pick<Category, 'name' | 'description' | 'color' | 'icon'>) {
  if (editingCategory.value) {
    store.updateCategory(editingCategory.value.id, data)
  }
  showEdit.value = false
}

function handleDelete() {
  if (deletingCategory.value) {
    store.deleteCategory(deletingCategory.value.id)
  }
}
</script>

<style scoped>
.categories-view {
  padding: var(--sp-8) 0 var(--sp-16);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-8);
  flex-wrap: wrap;
  gap: var(--sp-4);
}

.page-title {
  font-size: 2rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--sp-6);
  list-style: none;
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}

.empty-state {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--sp-16);
  text-align: center;
  border: 2px dashed var(--color-surface-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
}

.empty-icon {
  font-size: 3rem;
}

.empty-state p {
  color: var(--color-text-soft);
}
</style>
