<template>
  <div class="settings-view">
    <div class="container">
      <h1 class="page-title">Paramètres</h1>

      <div class="sections">

        <!-- ── Notifications ─────────────────────────────────────────────── -->
        <section class="card" aria-labelledby="notif-title">
          <h2 id="notif-title" class="card__title">🔔 Rappels quotidiens</h2>

          <div class="row">
            <div class="row__info">
              <label class="row__label" for="notif-toggle">Activer les rappels</label>
              <p class="row__desc">Une notification chaque jour à l'heure choisie vous rappelle de réviser</p>
            </div>
            <button
              id="notif-toggle"
              class="toggle"
              :class="{ active: store.settings.notificationsEnabled }"
              :aria-checked="store.settings.notificationsEnabled"
              role="switch"
              @click="toggleNotifications"
            >
              <span class="toggle__thumb" />
            </button>
          </div>

          <div v-if="store.settings.notificationsEnabled" class="row">
            <div class="row__info">
              <label class="row__label" for="notif-time">Heure du rappel</label>
              <p class="row__desc">La notification sera envoyée chaque jour à cette heure</p>
            </div>
            <input
              id="notif-time"
              type="time"
              class="time-input"
              :value="store.settings.notificationTime"
              @change="updateNotifTime(($event.target as HTMLInputElement).value)"
            />
          </div>

          <div v-if="notifStatus === 'denied'" class="alert alert--warn" role="alert">
            ⚠️ Les notifications sont bloquées dans votre navigateur. Autorisez-les dans les paramètres du navigateur puis réessayez.
          </div>
          <div v-if="notifStatus === 'unsupported'" class="alert alert--warn" role="alert">
            ⚠️ Votre navigateur ne supporte pas les notifications.
          </div>
          <div v-if="notifStatus === 'scheduled'" class="alert alert--ok" role="status">
            ✅ Rappel programmé à {{ store.settings.notificationTime }} chaque jour.
          </div>

          <button
            v-if="store.settings.notificationsEnabled"
            class="btn-ghost-sm"
            @click="sendTestNotif"
          >
            🔔 Envoyer une notification de test
          </button>
        </section>

        <!-- ── Defaults ──────────────────────────────────────────────────── -->
        <section class="card" aria-labelledby="defaults-title">
          <h2 id="defaults-title" class="card__title">🎯 Valeurs par défaut</h2>

          <div class="row">
            <div class="row__info">
              <label class="row__label" for="default-levels">Nombre de niveaux par thème</label>
              <p class="row__desc">Nombre de niveaux avant qu'une carte soit considérée maîtrisée (défaut : 7)</p>
            </div>
            <input
              id="default-levels"
              type="number"
              class="num-input"
              :value="store.settings.defaultMaxLevel"
              min="2" max="15"
              @change="store.updateSettings({ defaultMaxLevel: +($event.target as HTMLInputElement).value })"
            />
          </div>

          <div class="row">
            <div class="row__info">
              <label class="row__label" for="default-new">Nouvelles cartes par jour</label>
              <p class="row__desc">Nombre de nouvelles cartes introduites chaque jour (défaut : 10)</p>
            </div>
            <input
              id="default-new"
              type="number"
              class="num-input"
              :value="store.settings.defaultNewCardsPerDay"
              min="1" max="100"
              @change="store.updateSettings({ defaultNewCardsPerDay: +($event.target as HTMLInputElement).value })"
            />
          </div>
        </section>

        <!-- ── Export ────────────────────────────────────────────────────── -->
        <section class="card" aria-labelledby="export-title">
          <h2 id="export-title" class="card__title">📤 Exporter</h2>

          <div class="row">
            <div class="row__info">
              <span class="row__label">Tout exporter</span>
              <p class="row__desc">Télécharger toutes vos catégories et thèmes en JSON</p>
            </div>
            <button class="btn-ghost-sm" @click="exportAll">📥 Tout exporter</button>
          </div>

          <div class="row">
            <div class="row__info">
              <span class="row__label">Exporter des catégories</span>
              <p class="row__desc">Choisissez les catégories à exporter</p>
            </div>
            <button class="btn-ghost-sm" @click="showExportPicker = true">📂 Choisir…</button>
          </div>
        </section>

        <!-- ── Import ────────────────────────────────────────────────────── -->
        <section class="card" aria-labelledby="import-title">
          <h2 id="import-title" class="card__title">📥 Importer</h2>

          <div class="row">
            <div class="row__info">
              <span class="row__label">Données de démonstration</span>
              <p class="row__desc">Charger des données d'exemple pour tester l'application</p>
            </div>
            <button class="btn-ghost-sm" @click="importTestDataConfirm = true">🧪 Démo</button>
          </div>

          <div class="row">
            <div class="row__info">
              <span class="row__label">Importer un fichier JSON</span>
              <p class="row__desc">
                Fusionner avec vos données existantes (les catégories avec le même ID sont mises à jour)
              </p>
            </div>
            <label class="btn-ghost-sm" tabindex="0" role="button">
              📁 Choisir un fichier
              <input type="file" accept=".json" class="sr-only" @change="importFromFile" />
            </label>
          </div>

          <div class="row danger-row">
            <div class="row__info">
              <span class="row__label danger-label">Supprimer toutes les données</span>
              <p class="row__desc">Remet l'application à zéro — irréversible</p>
            </div>
            <button class="btn-danger-sm" @click="clearAllConfirm = true">🗑️ Tout supprimer</button>
          </div>
        </section>

      </div>
    </div>

    <!-- ── Export category picker modal ─────────────────────────────────── -->
    <AppModal v-model="showExportPicker" title="Exporter des catégories">
      <p class="modal-hint">Cochez les catégories à inclure dans le fichier JSON :</p>
      <ul class="pick-list" role="list">
        <li v-for="cat in store.categories" :key="cat.id">
          <label class="pick-item">
            <input
              type="checkbox"
              :value="cat.id"
              v-model="exportPickIds"
              class="pick-check"
            />
            <span class="pick-dot" :style="{ background: cat.color }" />
            <span class="pick-name">{{ cat.icon }} {{ cat.name }}</span>
            <span class="pick-count">{{ cat.themes.length }} thème(s)</span>
          </label>
        </li>
      </ul>
      <template #footer>
        <button class="btn-ghost-sm" @click="showExportPicker = false">Annuler</button>
        <button class="btn-accent-sm" :disabled="exportPickIds.length === 0" @click="exportSelected">
          Exporter ({{ exportPickIds.length }})
        </button>
      </template>
    </AppModal>

    <!-- ── Confirms ──────────────────────────────────────────────────────── -->
    <ConfirmDialog
      v-model="clearAllConfirm"
      title="Supprimer toutes les données"
      message="Cette action est irréversible. Toutes vos catégories, thèmes et cartes seront supprimés."
      confirm-label="Tout supprimer"
      @confirm="clearAll"
    />
    <ConfirmDialog
      v-model="importTestDataConfirm"
      title="Charger les données de démo"
      message="Cela fusionnera les données de démo avec vos données actuelles."
      confirm-label="Importer"
      confirm-variant="primary"
      @confirm="importTestData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMemoryStore } from '@/stores/memory'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { testData } from '@/data/testData'

const store = useMemoryStore()

const clearAllConfirm     = ref(false)
const importTestDataConfirm = ref(false)
const showExportPicker    = ref(false)
const exportPickIds       = ref<string[]>([])

// ── Notification status ────────────────────────────────────────────────────
type NotifStatus = 'idle' | 'denied' | 'unsupported' | 'scheduled'
const notifStatus = ref<NotifStatus>('idle')

onMounted(() => {
  if (!('Notification' in window)) {
    notifStatus.value = 'unsupported'
  } else if (Notification.permission === 'denied') {
    notifStatus.value = 'denied'
  } else if (store.settings.notificationsEnabled && Notification.permission === 'granted') {
    notifStatus.value = 'scheduled'
  }
})

async function toggleNotifications() {
  if (!('Notification' in window)) { notifStatus.value = 'unsupported'; return }

  if (store.settings.notificationsEnabled) {
    store.updateSettings({ notificationsEnabled: false })
    notifStatus.value = 'idle'
    return
  }

  // Request permission
  const perm = await Notification.requestPermission()
  if (perm === 'granted') {
    const ok = await store.requestAndEnableNotifications()
    notifStatus.value = ok ? 'scheduled' : 'idle'
  } else if (perm === 'denied') {
    notifStatus.value = 'denied'
  }
}

function updateNotifTime(time: string) {
  store.updateSettings({ notificationTime: time })
  notifStatus.value = 'scheduled'
}

function sendTestNotif() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const count = store.cardsDueToday
  new Notification('Memory App – Test', {
    body: count > 0
      ? `Vous avez ${count} carte${count > 1 ? 's' : ''} à réviser aujourd'hui !`
      : 'Aucune révision pour aujourd\'hui. Beau travail !',
    icon: '/favicon.svg',
    tag: 'memory-test'
  })
}

// ── Export ─────────────────────────────────────────────────────────────────
function download(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportAll() {
  download(store.exportData(), `memory-export-${today()}.json`)
}

function exportSelected() {
  download(store.exportCategories(exportPickIds.value), `memory-categories-${today()}.json`)
  showExportPicker.value = false
  exportPickIds.value = []
}

function today() {
  return new Date().toISOString().split('T')[0]
}

// ── Import ─────────────────────────────────────────────────────────────────
function importFromFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target?.result as string)
      if (Array.isArray(data)) {
        store.mergeImportedCategories(data)
        alert(`✅ ${data.length} catégorie(s) importée(s) avec succès.`)
      } else {
        alert('❌ Format invalide : le fichier doit contenir un tableau de catégories.')
      }
    } catch {
      alert('❌ Fichier JSON invalide.')
    }
  }
  reader.readAsText(file)
}

function importTestData() {
  store.mergeImportedCategories(testData)
}

function clearAll() {
  store.importData([])
}
</script>

<style scoped>
.settings-view {
  padding: var(--sp-10) 0 var(--sp-16);
}

.page-title {
  font-size: 2rem;
  margin-bottom: var(--sp-8);
}

.sections {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

/* Card section */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--sp-6);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.card__title {
  font-size: 1rem;
  font-family: var(--font-body);
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: var(--sp-4);
  padding-bottom: var(--sp-4);
  border-bottom: 1px solid var(--color-surface-3);
}

/* Row */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-6);
  padding: var(--sp-4) 0;
  border-bottom: 1px solid var(--color-surface-3);
}
.row:last-child { border-bottom: none; padding-bottom: 0; }
.row:first-of-type { padding-top: 0; }

.row__info { flex: 1; }

.row__label {
  display: block;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
  margin-bottom: 2px;
}

.row__desc {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.danger-row { margin-top: var(--sp-2); }
.danger-label { color: var(--color-danger); }

/* Toggle switch */
.toggle {
  width: 48px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-border-strong);
  border: none;
  position: relative;
  cursor: pointer;
  transition: background var(--transition-base);
  flex-shrink: 0;
}
.toggle.active { background: var(--color-success); }

.toggle__thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 22px; height: 22px;
  border-radius: var(--radius-full);
  background: #fff;
  box-shadow: var(--shadow-sm);
  transition: left var(--transition-base);
}
.toggle.active .toggle__thumb { left: 23px; }

/* Inputs */
.num-input {
  width: 80px;
  padding: var(--sp-2) var(--sp-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast);
}
.num-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-glow); }

.time-input {
  padding: var(--sp-2) var(--sp-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast);
}
.time-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-glow); }

/* Alerts */
.alert {
  margin-top: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-lg);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.5;
}
.alert--warn { background: var(--color-warning-light); color: var(--color-warning); }
.alert--ok   { background: var(--color-success-light); color: var(--color-success); }

/* Buttons */
.btn-ghost-sm {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-soft);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-ghost-sm:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-light); }

.btn-accent-sm {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-2) var(--sp-5);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-accent);
  color: #fff;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.btn-accent-sm:hover { background: var(--color-accent-hover); }
.btn-accent-sm:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-danger-sm {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-2) var(--sp-4);
  border: 1.5px solid var(--color-danger);
  border-radius: var(--radius-lg);
  background: var(--color-danger-light);
  color: var(--color-danger);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-danger-sm:hover { background: var(--color-danger); color: #fff; }

/* Modal content */
.modal-hint {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  margin-bottom: var(--sp-4);
}

.pick-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.pick-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--transition-fast);
  background: var(--color-surface-2);
}
.pick-item:hover { border-color: var(--color-accent); }

.pick-check { accent-color: var(--color-accent); width: 16px; height: 16px; flex-shrink: 0; }

.pick-dot {
  width: 10px; height: 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.pick-name { flex: 1; font-weight: 600; font-size: 0.88rem; }

.pick-count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
}
</style>