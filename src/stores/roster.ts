import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useRosterStore = defineStore('roster', () => {
  const rosters = ref<any[]>([])
  const users = ref<any[]>([])
  const isLoading = ref(false)

  const fetchRosters = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/admin/roster')
      rosters.value = response.data.roster || []
    } catch (error) {
      console.error("Gagal mengambil data roster:", error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      users.value = response.data.users || []
    } catch (error) {
      console.error("Gagal mengambil data users:", error)
    }
  }

  const createRoster = async (payload: any) => {
    try {
      const response = await api.post('/admin/roster', payload)
      await fetchRosters()
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal menyimpan jam kerja' }
    }
  }

  // TAMBAHAN: Fungsi Edit
  const updateRoster = async (id: number, payload: any) => {
    try {
      const response = await api.put(`/admin/roster/${id}`, payload)
      await fetchRosters()
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal mengubah jam kerja' }
    }
  }

  // TAMBAHAN: Fungsi Delete
  const deleteRoster = async (id: number) => {
    try {
      const response = await api.delete(`/admin/roster/${id}`)
      await fetchRosters()
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal menghapus jam kerja' }
    }
  }

  return { rosters, users, isLoading, fetchRosters, fetchUsers, createRoster, updateRoster, deleteRoster }
})