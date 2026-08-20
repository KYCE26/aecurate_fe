import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useHubStore = defineStore('hubs', () => {
  const hubs = ref<any[]>([])
  const isLoading = ref(false)

  // Ambil semua data Hub
const fetchHubs = async () => {
    isLoading.value = true
    try {
      // PASTIKAN RUTENYA BENAR: /admin/hubs
      const response = await api.get('/admin/hubs')
      hubs.value = response.data.hubs || []
    } catch (error: any) {
      // Tambahkan console log untuk melihat error aslinya dari backend
      console.error("Gagal mengambil data hubs. Status:", error.response?.status, "Pesan:", error.response?.data?.error)
    } finally {
      isLoading.value = false
    }
  }

  // Tambah Hub baru
  const createHub = async (payload: { name: string, address: string }) => {
    try {
      const response = await api.post('/admin/hubs', payload)
      await fetchHubs() // Refresh data setelah nambah
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal menambah hub' }
    }
  }

  // Edit Hub
  const updateHub = async (id: number, payload: { name: string, address: string }) => {
    try {
      const response = await api.put(`/admin/hubs/${id}`, payload)
      await fetchHubs() // Refresh data
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal mengubah hub' }
    }
  }

  // Hapus Hub
  const deleteHub = async (id: number) => {
    try {
      const response = await api.delete(`/admin/hubs/${id}`)
      await fetchHubs() // Refresh data
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal menghapus hub' }
    }
  }

  return { hubs, isLoading, fetchHubs, createHub, updateHub, deleteHub }
})