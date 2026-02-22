<template>
  <span
    class="level-badge"
    :class="`level-${level}`"
    :aria-label="`Niveau ${level}`"
    :title="levelLabel"
  >
    {{ level }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  level: number
  maxLevel?: number
}>()

const levelLabel = computed(() => {
  if (props.level === 0) return 'Non introduite'
  if (props.level >= (props.maxLevel ?? 7)) return 'Maîtrisée'
  return `Niveau ${props.level}`
})
</script>

<script lang="ts">
export default { name: 'LevelBadge' }
</script>
