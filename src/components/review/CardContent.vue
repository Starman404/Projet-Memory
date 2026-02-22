<template>
  <div class="card-content">
    <p v-if="side.text" class="card-content__text">{{ side.text }}</p>
    <img
      v-if="side.media?.type === 'image'"
      :src="side.media.url"
      :alt="side.media.alt || 'Image de la carte'"
      class="card-content__img"
    />
    <audio
      v-if="side.media?.type === 'audio'"
      :src="side.media.url"
      controls
      class="card-content__audio"
    >
      <track kind="captions" />
    </audio>
    <video
      v-if="side.media?.type === 'video'"
      :src="side.media.url"
      controls
      class="card-content__video"
    >
      <track kind="captions" />
    </video>
    <p v-if="!side.text && !side.media" class="card-content__empty" aria-label="Aucun contenu">—</p>
  </div>
</template>

<script setup lang="ts">
import type { CardSide } from '@/types'

defineProps<{
  side: CardSide
}>()
</script>

<script lang="ts">
export default { name: 'CardContent' }
</script>

<style scoped>
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  max-height: 100%;
  overflow: auto;
}

.card-content__text {
  font-size: 1.4rem;
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
}

.card-content__img {
  max-height: 160px;
  border-radius: var(--radius-md);
  object-fit: contain;
}

.card-content__audio {
  width: 100%;
  max-width: 300px;
}

.card-content__video {
  max-height: 160px;
  border-radius: var(--radius-md);
}

.card-content__empty {
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
