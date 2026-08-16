import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Ambil data dari localStorage jika ada
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const login = async (email: string, role: string) => {
    // MOCKUP API LOGIN: Simulasi request ke backend
    token.value = 'dummy-jwt-token-aecurate'
    user.value = { 
      name: email.split('@')[0], 
      role: role, // 'admin' atau 'crew'
      isAvailable: true 
    }
    
    // Simpan ke Local Storage
    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = () => !!token.value

  return { token, user, login, logout, isAuthenticated }
})