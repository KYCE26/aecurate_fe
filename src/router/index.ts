import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 1. RUTE BERDIRI SENDIRI (TANPA SIDEBAR)
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login.vue'),
      meta: { requiresGuest: true }
    },
    
    // 2. RUTE TERBUNGKUS MAIN LAYOUT (ADA SIDEBAR & HEADER)
    {
      path: '/',
      component: MainLayout, 
      meta: { requiresAuth: true }, // Wajib Login
      children: [
        {
          path: '', // URL: /
          name: 'Dashboard',
          component: () => import('../pages/Dashboard.vue'),
        },
        {
          path: 'inventory', // URL: /inventory (Karena di dalam children, otomatis digabung)
          name: 'Inventory',
          component: () => import('../pages/Inventory.vue'),
        },
        {
          path: 'hubs',
          name: 'Hubs',
          component: () => import('../pages/Hubs.vue'),
        },
        {
          path: 'roster',
          name: 'Roster',
          component: () => import('../pages/Roster.vue'),
        },
        // Kalau lu bikin halaman Master Hub atau Antrian Tugas nanti, masukinnya DI SINI ya!
      ],
    },
  ],
})

// Navigation Guard (Middleware untuk proteksi Login)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
  } 
  else {
    next()
  }
})

export default router