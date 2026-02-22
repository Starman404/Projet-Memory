<template>
  <div class="ds-view">
    <div class="container">
      <h1 class="page-title">Design System</h1>
      <p class="page-desc">
        Documentation de tous les composants réutilisables de l'application Memory.
      </p>

      <!-- Colors -->
      <section class="ds-section" aria-labelledby="colors-title">
        <h2 id="colors-title">Couleurs</h2>
        <div class="color-grid">
          <div class="color-chip" style="background: var(--color-ink)">
            <span>Ink</span><code>#0d0d0d</code>
          </div>
          <div class="color-chip" style="background: var(--color-accent)">
            <span>Accent</span><code>#ff4d00</code>
          </div>
          <div class="color-chip" style="background: var(--color-success)">
            <span>Success</span><code>#00b894</code>
          </div>
          <div class="color-chip" style="background: var(--color-danger)">
            <span>Danger</span><code>#e63946</code>
          </div>
          <div
            class="color-chip"
            style="
              background: var(--color-surface);
              border: 2px solid var(--color-surface-3);
              color: var(--color-ink);
            "
          >
            <span>Surface</span><code>#f5f0e8</code>
          </div>
        </div>

        <h3>Niveaux</h3>
        <div class="color-grid">
          <div
            v-for="i in 8"
            :key="i"
            class="color-chip"
            :style="{
              background: `var(--level-${i - 1})`,
              color: [3, 4].includes(i - 1) ? 'var(--color-ink)' : 'white',
            }"
          >
            <span>Niveau {{ i - 1 }}</span>
          </div>
        </div>
      </section>

      <!-- Typography -->
      <section class="ds-section" aria-labelledby="typo-title">
        <h2 id="typo-title">Typographie</h2>
        <div class="typo-samples">
          <div class="typo-sample">
            <span class="typo-label">Display XL (h1)</span>
            <p style="font-family: var(--font-display); font-size: 3rem; font-weight: 800">
              Memory App
            </p>
          </div>
          <div class="typo-sample">
            <span class="typo-label">Display L (h2)</span>
            <p style="font-family: var(--font-display); font-size: 2rem; font-weight: 700">
              Mes catégories
            </p>
          </div>
          <div class="typo-sample">
            <span class="typo-label">Body</span>
            <p style="font-family: var(--font-body); font-size: 1rem">
              La répétition espacée optimise votre mémorisation.
            </p>
          </div>
          <div class="typo-sample">
            <span class="typo-label">Small</span>
            <p
              style="
                font-family: var(--font-body);
                font-size: 0.85rem;
                color: var(--color-text-soft);
              "
            >
              Texte secondaire et descriptions
            </p>
          </div>
        </div>
      </section>

      <!-- Buttons -->
      <section class="ds-section" aria-labelledby="btn-title">
        <h2 id="btn-title">Boutons (AppButton)</h2>
        <div class="component-row">
          <AppButton variant="primary">Primary</AppButton>
          <AppButton variant="secondary">Secondary</AppButton>
          <AppButton variant="ghost">Ghost</AppButton>
          <AppButton variant="danger">Danger</AppButton>
          <AppButton variant="success">Success</AppButton>
        </div>
        <h3>Tailles</h3>
        <div class="component-row" style="align-items: center">
          <AppButton variant="primary" size="sm">Small</AppButton>
          <AppButton variant="primary" size="md">Medium</AppButton>
          <AppButton variant="primary" size="lg">Large</AppButton>
        </div>
        <h3>États</h3>
        <div class="component-row">
          <AppButton variant="primary" :loading="true">Chargement...</AppButton>
          <AppButton variant="primary" :disabled="true">Désactivé</AppButton>
          <AppButton variant="primary" icon="🎯">Avec icône</AppButton>
          <AppButton variant="primary" icon="✏️" icon-only aria-label="Modifier"></AppButton>
        </div>
      </section>

      <!-- Inputs -->
      <section class="ds-section" aria-labelledby="input-title">
        <h2 id="input-title">Champs (AppInput)</h2>
        <div class="inputs-grid">
          <AppInput label="Champ texte" placeholder="Entrez du texte..." />
          <AppInput label="Requis" required placeholder="Champ obligatoire" />
          <AppInput label="Avec aide" hint="Ce champ accepte des emojis 🎉" placeholder="..." />
          <AppInput
            label="Avec erreur"
            error="Ce champ est invalide"
            model-value="valeur incorrecte"
          />
          <AppInput
            label="Textarea"
            type="textarea"
            :rows="3"
            placeholder="Description longue..."
          />
        </div>
      </section>

      <!-- Level badges -->
      <section class="ds-section" aria-labelledby="badge-title">
        <h2 id="badge-title">Badges de niveau (LevelBadge)</h2>
        <div class="component-row">
          <LevelBadge v-for="i in 8" :key="i" :level="i - 1" :maxLevel="7" />
        </div>
      </section>

      <!-- Progress bar -->
      <section class="ds-section" aria-labelledby="progress-title">
        <h2 id="progress-title">Barre de progression (ProgressBar)</h2>
        <div class="progress-demos">
          <ProgressBar :value="0" aria-label="0%" />
          <ProgressBar :value="25" aria-label="25%" />
          <ProgressBar :value="65" aria-label="65%" />
          <ProgressBar :value="100" aria-label="100%" />
          <ProgressBar :value="45" color="var(--color-success)" aria-label="45% succès" />
        </div>
      </section>

      <!-- Media uploader -->
      <section class="ds-section" aria-labelledby="media-title">
        <h2 id="media-title">Upload média (MediaUploader)</h2>
        <MediaUploader v-model="demoMedia" />
      </section>

      <!-- Cards -->
      <section class="ds-section" aria-labelledby="cards-title">
        <h2 id="cards-title">Carte catégorie (CategoryCard)</h2>
        <div class="cards-grid">
          <CategoryCard :category="demoCategory" @edit="() => {}" @delete="() => {}" />
        </div>
      </section>

      <!-- Modal demo -->
      <section class="ds-section" aria-labelledby="modal-title">
        <h2 id="modal-title">Modale (AppModal)</h2>
        <AppButton variant="secondary" @click="showDemoModal = true">Ouvrir une modale</AppButton>
        <AppModal v-model="showDemoModal" title="Exemple de modale">
          <p>
            Contenu de la modale. Elle est accessible avec gestion du focus, aria-modal et fermeture
            au clic externe.
          </p>
          <template #footer>
            <AppButton variant="ghost" @click="showDemoModal = false">Annuler</AppButton>
            <AppButton variant="primary" @click="showDemoModal = false">Confirmer</AppButton>
          </template>
        </AppModal>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Category, MediaContent } from '@/types'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppModal from '@/components/ui/AppModal.vue'
import LevelBadge from '@/components/ui/LevelBadge.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import MediaUploader from '@/components/ui/MediaUploader.vue'
import CategoryCard from '@/components/categories/CategoryCard.vue'

const showDemoModal = ref(false)
const demoMedia = ref<MediaContent | undefined>()

const demoCategory: Category = {
  id: 'demo',
  name: 'Espagnol',
  description: 'Vocabulaire et grammaire espagnole',
  color: '#2196f3',
  icon: '🌍',
  themes: [
    {
      id: 't1',
      categoryId: 'demo',
      name: 'Vocabulaire débutant',
      cards: Array.from({ length: 20 }, (_, i) => ({
        id: `c${i}`,
        themeId: 't1',
        front: { text: `Mot ${i + 1}` },
        back: { text: `Word ${i + 1}` },
        level: i % 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      maxLevel: 7,
      newCardsPerDay: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
</script>

<style scoped>
.ds-view {
  padding: var(--sp-8) 0 var(--sp-16);
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: var(--sp-2);
}

.page-desc {
  color: var(--color-text-soft);
  margin-bottom: var(--sp-10);
}

.ds-section {
  margin-bottom: var(--sp-12);
}

.ds-section h2 {
  font-size: 1.5rem;
  margin-bottom: var(--sp-6);
  padding-bottom: var(--sp-3);
  border-bottom: 2px solid var(--color-surface-3);
}

.ds-section h3 {
  font-size: 1rem;
  margin: var(--sp-5) 0 var(--sp-3);
  color: var(--color-text-soft);
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-4);
  margin-bottom: var(--sp-5);
}

.color-chip {
  width: 120px;
  height: 80px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  gap: var(--sp-1);
}

.color-chip code {
  font-size: 0.7rem;
  opacity: 0.8;
}

.typo-samples {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.typo-sample {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.typo-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.component-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  align-items: flex-start;
  margin-bottom: var(--sp-4);
}

.inputs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--sp-5);
}

.progress-demos {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  max-width: 500px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--sp-4);
}
</style>
