<template>
  <div class="p-4 md:p-8 max-w-3xl mx-auto pb-24">
    <div class="mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Pengembalian</h1>
      <p class="text-slate-500 font-medium text-sm mt-1">Daftar barang operasional yang menjadi tanggung jawab Anda saat ini.</p>
    </div>

    <!-- Tab Filter -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <v-chip color="blue-darken-3" variant="flat" class="font-bold">Belum Dikembalikan ({{ onHandItems.length }})</v-chip>
      <v-chip color="slate-300" variant="outlined" class="font-bold text-slate-600">Menunggu Verifikasi (0)</v-chip>
      <v-chip color="slate-300" variant="outlined" class="font-bold text-slate-600">Selesai (0)</v-chip>
    </div>

    <!-- List Barang On-Hand (Simulasi Data Sementara) -->
    <div class="space-y-4">
      <div v-if="onHandItems.length === 0" class="p-8 text-center bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-300">
        <v-icon icon="mdi-check-all" size="40" color="green-darken-2" class="mb-2"></v-icon>
        <p class="text-slate-600 font-bold">Semua barang telah dikembalikan.</p>
      </div>
      
      <div v-for="item in onHandItems" :key="item.id" class="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
            <v-icon icon="mdi-package-variant" color="slate-400"></v-icon>
          </div>
          <div>
            <h3 class="font-bold text-slate-800">{{ item.name }}</h3>
            <p class="text-xs font-bold text-slate-500 mt-1">Dipinjam: {{ item.borrowDate }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
          <div class="text-center sm:text-right px-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah On-Hand</p>
            <p class="text-lg font-black text-blue-700">{{ item.qty }}</p>
          </div>
          <v-btn color="blue-darken-3" variant="tonal" class="rounded-lg font-bold" @click="openReturnDialog(item)">
            Kembalikan
          </v-btn>
        </div>
        
      </div>
    </div>

    <!-- Modal Konfirmasi & Form Pengembalian -->
    <v-dialog v-model="isDialogOpenned" max-width="450" persistent>
      <v-card class="rounded-[1.5rem] border border-slate-100 shadow-2xl">
        <v-card-title class="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white">
          <div class="p-2 bg-blue-50 rounded-lg">
            <v-icon icon="mdi-keyboard-return" color="blue-darken-3" size="20"></v-icon>
          </div>
          <span class="text-lg font-black text-slate-800">Proses Pengembalian</span>
        </v-card-title>

        <v-card-text class="p-6 bg-slate-50">
          <v-form ref="form" @submit.prevent="confirmReturn">
            
            <div class="mb-6 p-4 bg-white border border-slate-200 rounded-xl">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Barang Dikembalikan</p>
              <div class="flex justify-between items-center">
                <span class="font-bold text-slate-800">{{ selectedItem?.name }}</span>
                <span class="font-black text-blue-700">x{{ formData.qty }}</span>
              </div>
            </div>

            <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Jumlah yang Dikembalikan</label>
            <div class="flex items-center gap-4 mb-4 bg-white p-2 rounded-xl border border-slate-200">
              <v-btn icon="mdi-minus" variant="tonal" color="red-darken-1" size="small" class="rounded-lg" @click="formData.qty > 1 ? formData.qty-- : null"></v-btn>
              <input type="number" v-model="formData.qty" min="1" :max="selectedItem?.qty" class="w-full text-center text-2xl font-black text-slate-800 bg-transparent focus:outline-none" />
              <v-btn icon="mdi-plus" variant="tonal" color="green-darken-1" size="small" class="rounded-lg" @click="formData.qty < selectedItem?.qty ? formData.qty++ : null"></v-btn>
            </div>

            <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Dikembalikan ke (Hub)</label>
            <v-select
              v-model="formData.hub_id"
              :items="hubStore.hubs"
              item-title="name"
              item-value="ID"
              placeholder="Pilih lokasi pengembalian"
              variant="outlined"
              density="comfortable"
              class="mb-4 enterprise-input bg-white"
              :rules="[v => !!v || 'Lokasi pengembalian wajib dipilih']"
            ></v-select>

            <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Keterangan / Kondisi</label>
            <v-textarea
              v-model="formData.keterangan"
              placeholder="Misal: Dikembalikan lengkap, kondisi baik."
              variant="outlined"
              density="comfortable"
              rows="2"
              class="enterprise-input bg-white"
              hide-details="auto"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-4 border-t border-slate-100 bg-white">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="slate-500" class="font-bold px-4 text-none" @click="isDialogOpenned = false" :disabled="transactionStore.isProcessing">Batal</v-btn>
          <v-btn color="blue-darken-3" variant="flat" class="font-bold px-6 rounded-xl shadow-md text-none" @click="confirmReturn" :loading="transactionStore.isProcessing">Proses Return</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" :timeout="3000" class="mt-16">
      <div class="flex items-center gap-3 font-bold tracking-wide">
        <v-icon :icon="snackbar.icon" size="20"></v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHubStore } from '../stores/hubs'
import { useTransactionStore } from '../stores/transaction'

const hubStore = useHubStore()
const transactionStore = useTransactionStore()

onMounted(async () => {
  await hubStore.fetchHubs() // Tarik data hub buat dropdown lokasi pengembalian
})

// Simulasi Data On-Hand (Nanti bisa diganti API fetch)
// Note: Pastikan ID barang ini cocok dengan ID barang yang ada di database lu
const onHandItems = ref([
  { id: 1, name: 'HT Motorola', qty: 3, borrowDate: 'Hari ini, 06:00' },
  { id: 2, name: 'Tenda Sarnafil 3x3', qty: 1, borrowDate: 'Kemarin, 14:00' }
])

const form = ref<any>(null)
const isDialogOpenned = ref(false)
const selectedItem = ref<any>(null)
const formData = ref({
  qty: 1,
  hub_id: null,
  keterangan: ''
})

const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color: type === 'success' ? 'green-darken-2' : 'red-darken-2', icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }
}

const openReturnDialog = (item: any) => {
  selectedItem.value = item
  formData.value = { qty: item.qty, hub_id: null, keterangan: '' }
  isDialogOpenned.value = true
}

const confirmReturn = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  const payload = {
    barang_id: selectedItem.value.id, // Ambil ID barang dari list
    qty: Number(formData.value.qty),
    hub_id: formData.value.hub_id!,
    keterangan: formData.value.keterangan
  }

  const result = await transactionStore.processReturn(payload)

  if (result.success) {
    showNotif('Pengembalian berhasil diproses!', 'success')
    
    // Hapus atau kurangi item dari list on-hand secara lokal
    const index = onHandItems.value.findIndex(i => i.id === selectedItem.value.id)
    if (index !== -1) {
      if (onHandItems.value[index].qty === formData.value.qty) {
        onHandItems.value.splice(index, 1) // Hapus jika dikembalikan semua
      } else {
        onHandItems.value[index].qty -= formData.value.qty // Kurangi sisa jika sebagian
      }
    }
    
    isDialogOpenned.value = false
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
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none; margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
</style>