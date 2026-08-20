import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<any[]>([])
  const isLoading = ref(false)

  const fetchItems = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/admin/barang')
      items.value = response.data.barang || []
    } catch (error) {
      console.error("Gagal mengambil data barang:", error)
    } finally {
      isLoading.value = false
    }
  }

  const createItem = async (payload: any) => {
    try {
      const response = await api.post('/admin/barang', payload)
      await fetchItems()
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal menambah barang' }
    }
  }

  const updateItem = async (id: number, payload: any) => {
    try {
      const response = await api.put(`/admin/barang/${id}`, payload)
      await fetchItems()
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal mengubah barang' }
    }
  }

  const deleteItem = async (id: number) => {
    try {
      const response = await api.delete(`/admin/barang/${id}`)
      await fetchItems()
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal menghapus barang' }
    }
  }

  return { items, isLoading, fetchItems, createItem, updateItem, deleteItem }
})