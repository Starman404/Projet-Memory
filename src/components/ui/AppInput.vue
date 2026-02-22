<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-label="requis"> *</span>
    </label>
    <component
      :is="type === 'textarea' ? 'textarea' : 'input'"
      :id="id"
      class="field__input"
      :class="{ 'field__input--error': error, 'field__input--ta': type === 'textarea' }"
      :type="type !== 'textarea' ? type : undefined"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :aria-describedby="error ? eid : hint ? hid : undefined"
      :aria-invalid="!!error"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="hint && !error" :id="hid" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="eid" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { generateId } from '@/utils/helpers'
defineProps<{
  modelValue?: string | number; label?: string; type?: string;
  placeholder?: string; required?: boolean; disabled?: boolean;
  error?: string; hint?: string; rows?: number
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
const id  = `inp-${generateId()}`
const eid = `${id}-err`
const hid = `${id}-hint`
</script>

<script lang="ts">
export default { name: 'AppInput' }
</script>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--sp-2); }

.field__label {
  font-size: 0.78rem; font-weight: 800;
  color: var(--color-text-soft);
  text-transform: uppercase; letter-spacing: 0.05em;
}
.field__req { color: var(--color-danger); }

.field__input {
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 0.9rem; color: var(--color-text);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}
.field__input::placeholder { color: var(--color-text-muted); }
.field__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-glow);
}
.field__input--error { border-color: var(--color-danger); }
.field__input--error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.12); }
.field__input--ta { resize: vertical; min-height: 80px; }
.field__input:disabled { opacity: 0.5; cursor: not-allowed; background: var(--color-surface-3); }

.field__hint  { font-size: 0.72rem; color: var(--color-text-muted); }
.field__error { font-size: 0.72rem; color: var(--color-danger); font-weight: 700; }
</style>
