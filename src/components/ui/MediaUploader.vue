<template>
  <div class="media-uploader">
    <div
      v-if="!modelValue"
      class="media-uploader__dropzone"
      :class="{ 'media-uploader__dropzone--drag': isDragging }"
      role="button"
      tabindex="0"
      :aria-label="`Ajouter un fichier ${acceptLabel}`"
      @click="triggerInput"
      @keydown.enter="triggerInput"
      @keydown.space.prevent="triggerInput"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <span class="media-uploader__icon" aria-hidden="true">{{ icon }}</span>
      <p class="media-uploader__text">Glisser ou <strong>cliquer</strong> pour ajouter</p>
      <p class="media-uploader__accept">{{ acceptLabel }}</p>
    </div>

    <div v-else class="media-uploader__preview">
      <img
        v-if="modelValue.type === 'image'"
        :src="modelValue.url"
        :alt="modelValue.alt || 'Image'"
        class="media-preview__img"
      />
      <audio
        v-else-if="modelValue.type === 'audio'"
        :src="modelValue.url"
        controls
        class="media-preview__audio"
      >
        <track kind="captions" />
      </audio>
      <video
        v-else-if="modelValue.type === 'video'"
        :src="modelValue.url"
        controls
        class="media-preview__video"
      >
        <track kind="captions" />
      </video>
      <div class="media-preview__actions">
        <input
          v-if="modelValue.type === 'image'"
          class="alt-input"
          :value="modelValue.alt"
          placeholder="Texte alternatif (accessibilité)"
          :aria-label="'Texte alternatif de l\'image'"
          @input="updateAlt(($event.target as HTMLInputElement).value)"
        />
        <button
          class="media-preview__remove"
          @click="$emit('update:modelValue', undefined)"
          aria-label="Supprimer le média"
        >
          ✕ Supprimer
        </button>
      </div>
    </div>

    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      class="sr-only"
      aria-hidden="true"
      tabindex="-1"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MediaContent } from '@/types'

const props = defineProps<{
  modelValue?: MediaContent
  accept?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MediaContent | undefined]
}>()

const inputRef = ref<HTMLInputElement>()
const isDragging = ref(false)

const accept = props.accept || 'image/*,audio/*,video/*'

const acceptLabel = 'Images, Audio, Vidéo'
const icon = '📎'

function triggerInput() {
  inputRef.value?.click()
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) processFile(file)
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const url = e.target?.result as string
    let type: 'image' | 'audio' | 'video' = 'image'
    if (file.type.startsWith('audio/')) type = 'audio'
    else if (file.type.startsWith('video/')) type = 'video'

    emit('update:modelValue', { type, url })
  }
  reader.readAsDataURL(file)
}

function updateAlt(alt: string) {
  if (props.modelValue) {
    emit('update:modelValue', { ...props.modelValue, alt })
  }
}
</script>

<style scoped>
.media-uploader__dropzone {
  border: 2px dashed var(--color-surface-3);
  border-radius: var(--radius-lg);
  padding: var(--sp-8);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-surface-2);
}

.media-uploader__dropzone:hover,
.media-uploader__dropzone--drag {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}

.media-uploader__icon {
  font-size: 2rem;
  display: block;
  margin-bottom: var(--sp-2);
}

.media-uploader__text {
  font-size: 0.9rem;
  color: var(--color-text-soft);
}

.media-uploader__accept {
  font-size: 0.8rem;
  color: var(--color-text-soft);
  margin-top: var(--sp-1);
}

.media-uploader__preview {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.media-preview__img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.media-preview__audio {
  width: 100%;
}

.media-preview__video {
  width: 100%;
  max-height: 200px;
  border-radius: var(--radius-md);
}

.media-preview__actions {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.alt-input {
  flex: 1;
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--color-surface-3);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.85rem;
  background: white;
}

.media-preview__remove {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--color-danger);
  transition: background var(--transition-fast);
  cursor: pointer;
  background: none;
  font-family: var(--font-body);
}

.media-preview__remove:hover {
  background: var(--color-danger-light);
}
</style>
