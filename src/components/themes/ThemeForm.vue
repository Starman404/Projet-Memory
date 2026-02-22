<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <div class="form-grid">
      <AppInput
        v-model="form.name"
        label="Nom du thème"
        placeholder="Ex: Vocabulaire espagnol..."
        required
        :error="errors.name"
      />
      <AppInput
        v-model="form.description"
        label="Description"
        type="textarea"
        placeholder="Description optionnelle..."
        :rows="2"
      />
      <div class="form-row">
        <div class="field">
          <label class="field__label" :for="maxLevelId">Nombre de niveaux</label>
          <input
            :id="maxLevelId"
            type="number"
            class="number-input"
            v-model.number="form.maxLevel"
            min="2"
            max="15"
          />
          <p class="field__hint">La carte est maîtrisée au niveau {{ form.maxLevel }}</p>
        </div>
        <div class="field">
          <label class="field__label" :for="newCardsId">Nouvelles cartes/jour</label>
          <input
            :id="newCardsId"
            type="number"
            class="number-input"
            v-model.number="form.newCardsPerDay"
            min="1"
            max="100"
          />
        </div>
      </div>
    </div>
    <div class="form-actions">
      <AppButton type="button" variant="ghost" @click="$emit('cancel')">Annuler</AppButton>
      <AppButton type="submit" variant="primary">{{ submitLabel || 'Enregistrer' }}</AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { Theme } from '@/types'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { generateId } from '@/utils/helpers'

const props = defineProps<{
  initial?: Partial<Theme>
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [data: Pick<Theme, 'name' | 'description' | 'maxLevel' | 'newCardsPerDay'>]
  cancel: []
}>()

const maxLevelId = `maxLevel-${generateId()}`
const newCardsId = `newCards-${generateId()}`

const form = reactive({
  name: props.initial?.name || '',
  description: props.initial?.description || '',
  maxLevel: props.initial?.maxLevel ?? 7,
  newCardsPerDay: props.initial?.newCardsPerDay ?? 10,
})

const errors = reactive({ name: '' })

function handleSubmit() {
  errors.name = form.name.trim() ? '' : 'Le nom est requis'
  if (errors.name) return
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    maxLevel: form.maxLevel,
    newCardsPerDay: form.newCardsPerDay,
  })
}
</script>

<style scoped>
.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin-bottom: var(--sp-6);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-4);
}

.field__label {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  display: block;
  margin-bottom: var(--sp-2);
}

.field__hint {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  margin-top: var(--sp-1);
}

.number-input {
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  border: 2px solid var(--color-surface-3);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-ink);
  background: white;
  outline: none;
  transition: border-color var(--transition-fast);
}

.number-input:focus {
  border-color: var(--color-accent);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-3);
}
</style>
