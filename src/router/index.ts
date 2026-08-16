import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login.vue'),
      meta: { requiresGuest: true } // Hanya bisa diakses kalau BELUM login
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true }, // WAJIB LOGIN
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../pages/Dashboard.vue'),
        },
        // Nanti lu bisa tambah /tasks, /inventory dll di sini
      ],
    },
  ],
})

// Navigation Guard (Middleware)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated()

  // Jika halaman butuh login tapi user belum login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // Jika user sudah login tapi mencoba akses halaman login
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
  } 
  else {
    next()
  }
})

export default router