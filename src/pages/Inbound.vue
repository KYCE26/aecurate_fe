<template>
  <div class="p-4 md:p-8 max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Barang Masuk (Inbound)</h1>
      <p class="text-slate-500 font-medium mt-1 text-sm">Registrasi stok awal atau tambahan ke Hub.</p>
    </div>

    <v-card elevation="0" class="rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
        <v-icon icon="mdi-package-down" color="blue-darken-3"></v-icon>
        <span class="font-bold text-blue-900">Form Pemasukan Barang</span>
      </div>
      
      <div class="p-5 md:p-8">
        <v-form ref="form" @submit.prevent="submitInbound">
          
          <label class="block text-sm font-bold text-slate-700 mb-2">Pilih Barang</label>
          <v-autocomplete
            v-model="formData.barang_id"
            :items="inventoryStore.items"
            item-title="name"
            item-value="ID"
            placeholder="Ketik atau pilih nama barang..."
            variant="outlined"
            density="comfortable"
            class="mb-2 enterprise-input"
            :rules="[v => !!v || 'Barang wajib dipilih']"
          ></v-autocomplete>

          <!-- Info Box Dinamis: Muncul kalau barang udah dipilih -->
          <v-expand-transition>
            <div v-if="selectedItemData" class="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Informasi Barang</p>
              <div class="flex justify-between items-center mt-1">
                <span class="text-sm font-medium text-slate-700">Lokasi Hub</span>
                <span class="text-sm font-bold text-slate-900">{{ selectedItemData.hub?.name || 'Tidak diketahui' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-slate-700">Stok Saat Ini</span>
                <span class="text-sm font-black text-blue-700">{{ selectedItemData.stok_tersedia }} Unit</span>
              </div>
            </div>
          </v-expand-transition>

          <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Masuk (Qty)</label>
          <div class="flex items-center gap-4 mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <v-btn icon="mdi-minus" variant="tonal" color="red-darken-1" size="large" class="rounded-xl" @click="formData.qty > 1 ? formData.qty-- : null"></v-btn>
            <input type="number" v-model="formData.qty" min="1" class="w-full text-center text-4xl font-black text-slate-800 bg-transparent focus:outline-none" />
            <v-btn icon="mdi-plus" variant="tonal" color="green-darken-1" size="large" class="rounded-xl" @click="formData.qty++"></v-btn>
          </div>

          <label class="block text-sm font-bold text-slate-700 mb-2">Keterangan / Catatan</label>
          <v-textarea
            v-model="formData.keterangan"
            placeholder="Misal: Restock dari supplier pusat, Kondisi aman."
            variant="outlined"
            density="comfortable"
            rows="2"
            class="mb-8 enterprise-input"
            hide-details="auto"
          ></v-textarea>

          <v-btn 
            type="submit"
            block 
            size="x-large" 
            color="blue-darken-3" 
            variant="flat" 
            class="rounded-xl shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5 transition-all" 
            :loading="transactionStore.isProcessing"
          >
            <span class="font-bold tracking-widest text-sm uppercase">Simpan Barang Masuk</span>
          </v-btn>
        </v-form>
      </div>
    </v-card>

    <!-- Snackbar Notifikasi -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" :timeout="3000" class="mt-16">
      <div class="flex items-center gap-3 font-bold tracking-wide">
        <v-icon :icon="snackbar.icon" size="20"></v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '../stores/inventory'
import { useTransactionStore } from '../stores/transaction'

const inventoryStore = useInventoryStore()
const transactionStore = useTransactionStore()

const form = ref<any>(null)
const formData = ref({
  barang_id: null,
  qty: 1,
  keterangan: ''
})

// Tarik master barang waktu halaman dibuka
onMounted(async () => {
  await inventoryStore.fetchItems()
})

// Bikin Computed untuk nyari data detail dari barang yang lagi dipilih di dropdown
const selectedItemData = computed(() => {
  if (!formData.value.barang_id) return null
  return inventoryStore.items.find(i => i.ID === formData.value.barang_id)
})

// --- Notifikasi ---
const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color: type === 'success' ? 'green-darken-2' : 'red-darken-2', icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }
}

const submitInbound = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return
  if (formData.value.qty <= 0) {
    showNotif('Jumlah barang masuk minimal 1', 'error')
    return
  }

  const payload = {
    barang_id: formData.value.barang_id!,
    qty: Number(formData.value.qty),
    keterangan: formData.value.keterangan
  }

  const result = await transactionStore.processInbound(payload)

  if (result.success) {
    showNotif(result.message, 'success')
    // Reset Form
    formData.value.barang_id = null
    formData.value.qty = 1
    formData.value.keterangan = ''
    
    // Tarik ulang data inventory biar info stok di memori update!
    await inventoryStore.fetchItems() 
  } else {
    showNotif(result.message, 'error')
  }
}
</script>

<style scoped>
:deep(.v-field) {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
:deep(.v-field:hover) { border-color: #cbd5e1; }
:deep(.v-field--focused) {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}
:deep(.v-field__outline) { display: none; }
/* Sembunyikan panah up/down default pada input number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>