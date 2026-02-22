<template>
  <div class="progress" :aria-label="ariaLabel" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100">
    <div class="progress__bar" :style="{ width: `${value}%`, background: color || 'var(--color-accent)' }"></div>
    <span v-if="showLabel" class="progress__label" aria-hidden="true">{{ value }}%</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: number
  color?: string
  showLabel?: boolean
  ariaLabel?: string
}>()
</script>

<script lang="ts">
export default { name: 'ProgressBar' }
</script>

<style scoped>
.progress {
  position: relative;
  height: 8px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.progress__label {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-display);
}
</style>
