<template>
  <div id="app">
    <AppNavbar />
    <main id="main-content" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/ui/AppNavbar.vue'
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
  padding-top: 60px;
}
</style>
