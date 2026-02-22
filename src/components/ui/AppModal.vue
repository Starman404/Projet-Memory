<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="modelValue"
        class="overlay"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.escape="$emit('update:modelValue', false)"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="modal" ref="modalRef">
          <header class="modal__head">
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
            <button class="modal__close" aria-label="Fermer" @click="$emit('update:modelValue', false)">✕</button>
          </header>
          <div class="modal__body"><slot /></div>
          <footer v-if="$slots.footer" class="modal__foot"><slot name="footer" /></footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { generateId } from '@/utils/helpers'
const props = defineProps<{ modelValue: boolean; title: string }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
const titleId  = `modal-${generateId()}`
const modalRef = ref<HTMLElement>()
watch(() => props.modelValue, async (open) => {
  if (open) { await nextTick(); modalRef.value?.focus(); document.body.style.overflow = 'hidden' }
  else { document.body.style.overflow = '' }
})
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(26,23,20,0.40);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: var(--sp-4);
}

.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  width: 100%; max-width: 560px; max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  outline: none;
  animation: fadeInUp var(--transition-base) both;
}

.modal__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--sp-5) var(--sp-6);
  border-bottom: 1px solid var(--color-border);
}

.modal__title { font-size: 1.1rem; }

.modal__close {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-full);
  color: var(--color-text-muted); font-size: 0.82rem;
  transition: all var(--transition-fast); cursor: pointer;
}
.modal__close:hover { background: var(--color-danger-light); color: var(--color-danger); }

.modal__body { padding: var(--sp-6); }

.modal__foot {
  display: flex; align-items: center; justify-content: flex-end;
  gap: var(--sp-3); padding: var(--sp-4) var(--sp-6);
  border-top: 1px solid var(--color-border);
}

.modal-enter-active, .modal-leave-active { transition: opacity var(--transition-base); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
