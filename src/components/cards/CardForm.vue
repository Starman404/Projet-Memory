<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <div class="card-form-grid">
      <fieldset class="card-side-field">
        <legend class="side-legend">Recto</legend>
        <AppInput
          v-model="form.front.text"
          label="Texte"
          type="textarea"
          placeholder="Texte du recto..."
          :rows="3"
        />
        <MediaUploader v-model="form.front.media" />
      </fieldset>

      <div class="card-arrow" aria-hidden="true">→</div>

      <fieldset class="card-side-field">
        <legend class="side-legend">Verso</legend>
        <AppInput
          v-model="form.back.text"
          label="Texte"
          type="textarea"
          placeholder="Texte du verso..."
          :rows="3"
        />
        <MediaUploader v-model="form.back.media" />
      </fieldset>
    </div>

    <p v-if="errors.content" class="form-error" role="alert">{{ errors.content }}</p>

    <div class="form-actions">
      <AppButton type="button" variant="ghost" @click="$emit('cancel')">Annuler</AppButton>
      <AppButton type="submit" variant="primary">{{ submitLabel || 'Enregistrer' }}</AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { Card, CardSide, MediaContent } from '@/types'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import MediaUploader from '@/components/ui/MediaUploader.vue'

const props = defineProps<{
  initial?: Partial<Card>
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [data: { front: CardSide; back: CardSide }]
  cancel: []
}>()

const form = reactive({
  front: {
    text: props.initial?.front?.text || '',
    media: props.initial?.front?.media as MediaContent | undefined,
  },
  back: {
    text: props.initial?.back?.text || '',
    media: props.initial?.back?.media as MediaContent | undefined,
  },
})

const errors = reactive({ content: '' })

function handleSubmit() {
  const frontHasContent = form.front.text?.trim() || form.front.media
  const backHasContent = form.back.text?.trim() || form.back.media

  if (!frontHasContent || !backHasContent) {
    errors.content = 'Recto et verso doivent avoir du contenu'
    return
  }
  errors.content = ''

  emit('submit', {
    front: {
      text: form.front.text?.trim() || undefined,
      media: form.front.media,
    },
    back: {
      text: form.back.text?.trim() || undefined,
      media: form.back.media,
    },
  })
}
</script>

<style scoped>
.card-form-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--sp-4);
  align-items: start;
  margin-bottom: var(--sp-6);
}

@media (max-width: 640px) {
  .card-form-grid {
    grid-template-columns: 1fr;
  }
  .card-arrow {
    transform: rotate(90deg);
    text-align: center;
  }
}

.card-side-field {
  border: 2px solid var(--color-surface-3);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.side-legend {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0 var(--sp-2);
  color: var(--color-ink);
}

.card-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #aaa;
  padding-top: var(--sp-8);
}

.form-error {
  color: var(--color-danger);
  font-size: 0.85rem;
  margin-bottom: var(--sp-4);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-3);
}
</style>
