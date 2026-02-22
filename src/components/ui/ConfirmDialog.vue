<template>
  <AppModal
    v-model="modelValue"
    :title="title"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <p class="confirm__message">{{ message }}</p>
    <template #footer>
      <AppButton variant="ghost" @click="$emit('update:modelValue', false)">Annuler</AppButton>
      <AppButton :variant="confirmVariant || 'danger'" @click="handleConfirm">{{
        confirmLabel || 'Confirmer'
      }}</AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger' | 'success'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.confirm__message {
  color: var(--color-text);
  line-height: 1.6;
}
</style>
