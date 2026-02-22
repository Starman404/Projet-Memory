<template>
  <button
    :class="['btn', `btn--${variant || 'primary'}`, `btn--${size || 'md'}`, { 'btn--loading': loading, 'btn--icon': iconOnly }]"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    v-bind="$attrs"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <span v-if="icon && !iconOnly" aria-hidden="true">{{ icon }}</span>
    <span v-if="iconOnly" aria-hidden="true">{{ icon }}</span>
    <span v-if="!iconOnly"><slot /></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: string
  iconOnly?: boolean
  ariaLabel?: string
}>()
defineOptions({ inheritAttrs: false })
</script>

<script lang="ts">
export default { name: 'AppButton' }
</script>

<style scoped>
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--sp-2); border-radius: var(--radius-lg);
  font-family: var(--font-body); font-weight: 700;
  cursor: pointer; transition: all var(--transition-fast);
  border: 1.5px solid transparent; white-space: nowrap; position: relative;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn--sm { padding: var(--sp-1) var(--sp-3); font-size: 0.78rem; height: 30px; }
.btn--md { padding: var(--sp-2) var(--sp-5); font-size: 0.875rem; height: 38px; }
.btn--lg { padding: var(--sp-3) var(--sp-8); font-size: 0.95rem; height: 46px; }

.btn--icon.btn--sm { width: 30px; padding: 0; }
.btn--icon.btn--md { width: 38px; padding: 0; }
.btn--icon.btn--lg { width: 46px; padding: 0; }

/* Variants */
.btn--primary { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-accent); }

.btn--secondary { background: var(--color-surface-3); color: var(--color-text); border-color: var(--color-border); }
.btn--secondary:hover:not(:disabled) { background: var(--color-border); transform: translateY(-1px); }

.btn--ghost { background: transparent; color: var(--color-text-soft); border-color: var(--color-border); }
.btn--ghost:hover:not(:disabled) { background: var(--color-surface-3); color: var(--color-text); border-color: var(--color-border-strong); }

.btn--danger { background: var(--color-danger); color: #fff; border-color: var(--color-danger); }
.btn--danger:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }

.btn--success { background: var(--color-success); color: #fff; border-color: var(--color-success); }
.btn--success:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
