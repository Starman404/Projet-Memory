# 🧠 Memory App — Répétition Espacée

Application web progressive (PWA) de mémorisation par répétition espacée, construite avec **Vue 3**, **TypeScript**, **Pinia** et **Vue Router**.

---

## ✅ Checklist des critères

| Critère                                                                         | Statut  | Notes                                                                  |
| ------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| CRUD catégories / thèmes / cartes avec texte & multimédia                       | ✅ Fait | Images, audio, vidéo via drag-and-drop                                 |
| Révision par répétition espacée (niveaux & nouvelles cartes/jour configurables) | ✅ Fait | Algorithme 2^(N-1), queue journalière ordonnée                         |
| Rappel quotidien par notification navigateur                                    | ✅ Fait | Permission, heure configurable, planification automatique              |
| Fonctionnement hors-ligne (Service Worker + Manifest)                           | ✅ Fait | SW network-first + cache fallback, manifest.json complet               |
| Code structuré, séparation composants, store & routeur Vue                      | ✅ Fait | Pinia store, Vue Router hash history, composants atomiques             |
| HTML propre et valide                                                           | ✅ Fait | Sémantique, ARIA labels, rôles appropriés                              |
| Application responsive                                                          | ✅ Fait | Mobile-first, breakpoints 480 / 640 / 900px                            |
| Interface intuitive et agréable                                                 | ✅ Fait | Thème clair éditorial, animations, feedback visuel                     |
| README complet                                                                  | ✅ Fait | Ce fichier                                                             |
| Données de test                                                                 | ✅ Fait | 3 catégories, 4 thèmes, 28 cartes (import depuis l'accueil)            |
| Design System                                                                   | ✅ Fait | Page `/design-system` avec tous les composants documentés              |
| Gestion multimédia (image, vidéo, audio)                                        | ✅ Fait | Uploader drag-and-drop, preview, texte alternatif                      |
| Tests (unitaires + e2e)                                                         | ✅ Fait | Vitest (unitaire) + Playwright (e2e)                                   |
| Accessibilité et performance                                                    | ✅ Fait | Rapport Lighthouse et Wave dans le dossier `accessibilite_performance` |

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
# → http://localhost:5173
```

### Build de production

```bash
npm run build
npm run preview
```

### Tests

```bash
# Tests unitaires (Vitest)
npm run test:unit

# Tests en mode watch
npm run test:unit:watch

# Couverture de code
npm run test:coverage

# Tests end-to-end (Playwright)
npm run test:e2e
```

---

## 📁 Organisation du code

```
src/
├── assets/
│   └── main.css              # Variables CSS, reset, utilitaires globaux
├── components/
│   ├── cards/
│   │   ├── CardForm.vue      # Formulaire création/édition d'une carte
│   │   └── CardItem.vue      # Affichage d'une carte dans la liste
│   ├── categories/
│   │   ├── CategoryCard.vue  # Carte d'une catégorie (grille)
│   │   └── CategoryForm.vue  # Formulaire création/édition catégorie
│   ├── review/
│   │   ├── CardContent.vue       # Rendu d'un côté de carte (texte + média)
│   │   ├── GlobalReviewSession.vue # Session de révision multi-thèmes
│   │   └── ReviewCard.vue        # Carte retournable (flip animation)
│   ├── themes/
│   │   ├── ThemeCard.vue     # Carte d'un thème (grille)
│   │   └── ThemeForm.vue     # Formulaire création/édition thème
│   └── ui/
│       ├── AppButton.vue     # Bouton générique (5 variantes, 3 tailles)
│       ├── AppInput.vue      # Champ texte/textarea avec label et erreur
│       ├── AppModal.vue      # Modale accessible (focus trap, Escape)
│       ├── AppNavbar.vue     # Barre de navigation responsive
│       ├── ConfirmDialog.vue # Boîte de confirmation destructive
│       ├── LevelBadge.vue    # Badge coloré indiquant le niveau d'une carte
│       ├── MediaUploader.vue # Upload drag-and-drop (image/audio/vidéo)
│       └── ProgressBar.vue   # Barre de progression accessible
├── data/
│   └── testData.ts           # 28 cartes de démo réparties en 3 catégories
├── router/
│   └── index.ts              # Routes Vue Router (hash history)
├── stores/
│   └── memory.ts             # Store Pinia : CRUD + notifications + import/export
├── types/
│   └── index.ts              # Interfaces TypeScript (Card, Theme, Category…)
├── utils/
│   ├── helpers.ts            # generateId, formatDate
│   └── spacedRepetition.ts   # Algorithme SR, calculs de dates, distributions
└── views/
    ├── CategoriesView.vue    # Liste des catégories
    ├── CategoryDetailView.vue# Détail d'une catégorie + gestion thèmes
    ├── DesignSystemView.vue  # Documentation de tous les composants UI
    ├── HomeView.vue          # Dashboard : stats, distribution niveaux, révisions du jour
    ├── ReviewView.vue        # Session de révision d'un thème
    ├── SettingsView.vue      # Paramètres : notifications, import/export
    └── ThemeDetailView.vue   # Détail d'un thème + liste de cartes
```

---

## 🧠 Algorithme de répétition espacée

L'algorithme suit le principe de la **répétition espacée exponentielle** :

| Niveau   | Intervalle de révision          |
| -------- | ------------------------------- |
| 0        | Non introduite (nouvelle carte) |
| 1        | 1 jour (2⁰)                     |
| 2        | 2 jours (2¹)                    |
| 3        | 4 jours (2²)                    |
| 4        | 8 jours (2³)                    |
| N        | 2^(N-1) jours                   |
| maxLevel | Maîtrisée — plus de révision    |

**Règles :**

- ✅ **Bonne réponse** → niveau +1, prochaine révision = aujourd'hui + intervalle(nouveauNiveau)
- ❌ **Mauvaise réponse** → retour niveau 1, prochaine révision = demain, carte remise en fin de file

**Ordre de la file journalière :**

1. Cartes de haut niveau dues (ordre décroissant)
2. Cartes niveau 1 dues
3. Nouvelles cartes (niveau 0, limitées par `newCardsPerDay`)

**Note sur le comptage :**  
Le nombre « À réviser » est inférieur au nombre total de cartes car :

- Les cartes **maîtrisées** (niveau = maxLevel) ne sont plus révisées
- Les **nouvelles cartes** au-delà du quota quotidien (`newCardsPerDay`) sont introduites progressivement
- Les cartes dont la date de révision est dans le **futur** ne sont pas encore dues

---

## 🔔 Notifications

Les rappels quotidiens utilisent l'**API Notifications du navigateur** :

1. L'utilisateur autorise les notifications dans Paramètres
2. Un `setTimeout` calcule les millisecondes jusqu'à l'heure choisie
3. La notification affiche le nombre de cartes à réviser
4. Le planificateur se replanifie automatiquement pour le lendemain
5. Le paramètre persiste dans `localStorage`

---

## 📱 PWA / Hors-ligne

- **`public/manifest.json`** : nom, icônes, couleurs, orientation, catégories
- **`public/sw.js`** : Service Worker network-first avec cache fallback
  - Installation : mise en cache des assets essentiels
  - Activation : nettoyage des anciens caches
  - Fetch : réseau en priorité, cache en fallback, `index.html` pour navigation offline

---

## 🔧 Stack technique

| Outil                   | Usage                                |
| ----------------------- | ------------------------------------ |
| Vue 3 (Composition API) | Framework UI                         |
| TypeScript              | Typage statique                      |
| Pinia                   | Store centralisé                     |
| Vue Router              | Navigation SPA (hash history)        |
| Vite                    | Bundler & dev server                 |
| Vitest                  | Tests unitaires                      |
| Playwright              | Tests end-to-end                     |
| CSS Variables           | Design system (pas de framework CSS) |

---

## 📊 Données de test

Les données de démonstration sont importables depuis la page d'accueil (bouton « Données de test »). Elles incluent :

- **Espagnol** : Vocabulaire débutant (12 cartes, niveaux 0–7) + Conjugaison présent (5 cartes)
- **Histoire** : Révolution Française (6 cartes, niveaux mixtes)
- **Programmation** : TypeScript (5 cartes)

Total : **28 cartes** réparties sur **4 thèmes** dans **3 catégories**.

---

## 🎨 Design System

Accessible via le menu **Paramètres → Design System** ou directement à `/#/design-system`.

Contient la documentation de : couleurs, typographie, spacing, boutons, champs, badges, barres de progression, modales, uploader multimédia.
