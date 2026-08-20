import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string>(localStorage.getItem('token') || '')

  // 👇 TAMBAHIN FUNGSI INI BIAR ROUTER LU NGGAK ERROR
  const isAuthenticated = () => {
    return !!token.value
  }

const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const data = response.data

      // 👇 TAMBAHIN 2 BARIS INI (Normalisasi Role Golang ke format Frontend kita)
      if (data.user.role === 'administrator') data.user.role = 'admin'
      if (data.user.role === 'petugas') data.user.role = 'crew'

      // Simpan ke state Pinia
      user.value = data.user
      token.value = data.token

      // Simpan ke localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)

      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Terjadi kesalahan koneksi ke server.'
      }
    }
  }

const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Terjadi kesalahan saat mendaftar.'
      }
    }
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // 👇 JANGAN LUPA MASUKIN isAuthenticated KE DALAM RETURN INI
  return { user, token, isAuthenticated, login, register, logout }
})