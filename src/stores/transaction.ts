import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useTransactionStore = defineStore('transaction', () => {
  const isProcessing = ref(false)

  // 1. Transaksi Inbound (Tambah Stok)
  const processInbound = async (payload: { barang_id: number, qty: number, keterangan: string }) => {
    isProcessing.value = true
    try {
      const response = await api.post('/transactions/inbound', payload)
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal memproses barang masuk' }
    } finally {
      isProcessing.value = false
    }
  }

  // 2. Transaksi Request (Permintaan Barang -> Bikin Task)
  const processRequest = async (payload: { barang_id: number, qty: number, requested_by: string, location: string, keterangan: string }) => {
    isProcessing.value = true
    try {
      const response = await api.post('/transactions/request', payload)
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal memproses permintaan' }
    } finally {
      isProcessing.value = false
    }
  }

const processHandover = async (payload: { barang_id: number, qty: number, from_user_id: number, to_user_id: number, keterangan: string }) => {
    isProcessing.value = true
    try {
      const response = await api.post('/transactions/handover', payload)
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal memproses serah terima' }
    } finally {
      isProcessing.value = false
    }
  }

const processMutation = async (payload: { barang_id: number, qty: number, from_hub_id: number, to_hub_id: number, keterangan: string }) => {
    isProcessing.value = true
    try {
      const response = await api.post('/transactions/mutation', payload)
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal memproses mutasi barang' }
    } finally {
      isProcessing.value = false
    }
  }

// 5. Transaksi Return (Pengembalian Barang)
  const processReturn = async (payload: { barang_id: number, qty: number, hub_id: number, keterangan: string }) => {
    isProcessing.value = true
    try {
      const response = await api.post('/transactions/return', payload)
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Gagal memproses pengembalian' }
    } finally {
      isProcessing.value = false
    }
  }

  // JANGAN LUPA masukin processReturn ke return bawah
  return { isProcessing, processInbound, processRequest, processHandover, processMutation, processReturn }
})