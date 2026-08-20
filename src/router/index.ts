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
    // 👇 Pindahkan Register ke SINI (Sejajar dengan Login)
    {
      path: '/register',
      name: 'Register',
      component: () => import('../pages/Register.vue'),
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
        { path: 'inventory', name: 'Inventory', component: () => import('../pages/Inventory.vue') },
        { path: 'hubs', name: 'Hubs', component: () => import('../pages/Hubs.vue') },
        { path: 'roster', name: 'Roster', component: () => import('../pages/Roster.vue') },
        { path: 'inbound', name: 'Inbound', component: () => import('../pages/Inbound.vue') },
        { path: 'request', name: 'Request', component: () => import('../pages/RequestItem.vue') },
        { path: 'handover', name: 'Handover', component: () => import('../pages/Handover.vue') },
        { path: 'mutation', name: 'Mutation', component: () => import('../pages/Mutation.vue') },
        { path: 'return', name: 'Return', component: () => import('../pages/Return.vue') },
        { path: 'tasks', name: 'Tasks', component: () => import('../pages/Tasks.vue') },
      ],
    },
  ],
})

// Navigation Guard (Middleware untuk proteksi Login)
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  
  // 1. Kalau halaman butuh login tapi user belum punya token
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    return '/login'
  }
  
  // 2. Kalau user udah login tapi iseng mau buka halaman Login atau Register
  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated()) {
    return '/'
  }
  
  // 3. Pengganti next() -> Biarkan user lewat
  return true
})

export default router