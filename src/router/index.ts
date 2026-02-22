import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoriesView.vue'),
    },
    {
      path: '/categories/:categoryId',
      name: 'category-detail',
      component: () => import('@/views/CategoryDetailView.vue'),
      props: true,
    },
    {
      path: '/themes/:themeId',
      name: 'theme-detail',
      component: () => import('@/views/ThemeDetailView.vue'),
      props: true,
    },
    {
      path: '/review/:themeId',
      name: 'review',
      component: () => import('@/views/ReviewView.vue'),
      props: true,
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/design-system',
      name: 'design-system',
      component: () => import('@/views/DesignSystemView.vue'),
    },
  ],
})

export default router
