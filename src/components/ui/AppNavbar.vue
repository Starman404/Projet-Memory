<template>
  <header class="navbar" role="banner">
    <nav class="navbar__inner container" aria-label="Navigation principale">
      <router-link to="/" class="navbar__logo" aria-label="Memory App — Accueil">
        <span aria-hidden="true">🧠</span>
        <span class="navbar__logo-text">Memory</span>
      </router-link>

      <button
        class="navbar__burger"
        :aria-expanded="menuOpen"
        aria-controls="navbar-menu"
        aria-label="Ouvrir le menu"
        @click="menuOpen = !menuOpen"
      >
        <span class="burger" :class="{ open: menuOpen }" aria-hidden="true">
          <span /><span /><span />
        </span>
      </button>

      <ul id="navbar-menu" class="navbar__links" :class="{ open: menuOpen }" role="list">
        <li>
          <router-link to="/" class="nav-link" @click="menuOpen = false">Accueil</router-link>
        </li>
        <li>
          <router-link to="/categories" class="nav-link" @click="menuOpen = false"
            >Catégories</router-link
          >
        </li>
        <li>
          <router-link to="/settings" class="nav-link" @click="menuOpen = false"
            >Paramètres</router-link
          >
        </li>
      </ul>

      <div v-if="store.cardsDueToday > 0" class="navbar__due" aria-live="polite">
        <span class="due-pill" :aria-label="`${store.cardsDueToday} cartes à réviser aujourd'hui`">
          ⚡ {{ store.cardsDueToday }}
        </span>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMemoryStore } from '@/stores/memory'
const store = useMemoryStore()
const menuOpen = ref(false)
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 60px;
  background: rgba(245, 240, 232, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 0 var(--color-border);
}

.navbar__inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--sp-6);
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 1.3rem;
  transition: color var(--transition-fast);
  flex-shrink: 0;
  text-decoration: none;
}
.navbar__logo:hover {
  color: var(--color-accent);
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 2px;
  list-style: none;
  margin-left: auto;
}

.nav-link {
  display: block;
  padding: 6px var(--sp-4);
  border-radius: var(--radius-lg);
  color: var(--color-text-soft);
  font-size: 0.875rem;
  font-weight: 700;
  transition: all var(--transition-fast);
  text-decoration: none;
}
.nav-link:hover {
  color: var(--color-text);
  background: var(--color-surface-3);
}
.nav-link.router-link-exact-active {
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.navbar__due {
  flex-shrink: 0;
}

.due-pill {
  display: inline-block;
  background: var(--color-accent);
  color: #fff;
  padding: 3px var(--sp-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

/* Burger — hidden on desktop */
.navbar__burger {
  display: none;
  padding: var(--sp-2);
  margin-left: auto;
  color: var(--color-text);
}

.burger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 20px;
}
.burger span {
  display: block;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
  transition:
    transform 150ms ease,
    opacity 150ms ease;
}
.burger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.burger.open span:nth-child(2) {
  opacity: 0;
}
.burger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 640px) {
  .navbar__burger {
    display: flex;
  }
  .navbar__links {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    flex-direction: column;
    align-items: stretch;
    padding: var(--sp-3);
    gap: 2px;
    margin-left: 0;
    transform: translateY(-110%);
    opacity: 0;
    pointer-events: none;
    transition:
      transform var(--transition-base),
      opacity var(--transition-base);
  }
  .navbar__links.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
  .nav-link {
    padding: var(--sp-3) var(--sp-4);
  }
}
</style>
