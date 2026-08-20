<template>
  <div class="p-4 md:p-8 max-w-lg mx-auto pb-24">
    <div class="text-center mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Serah Terima Barang</h1>
      <p class="text-slate-500 font-medium text-sm mt-1">Pindahkan tanggung jawab logistik ke kru lain.</p>
    </div>

    <v-card elevation="0" class="p-6 md:p-8 rounded-[1.5rem] border border-slate-200 shadow-sm">
      <v-form ref="form" @submit.prevent="submitHandover">

        <label class="block text-sm font-bold text-slate-700 mb-2">Barang yang Diserahkan</label>
        <v-autocomplete
          v-model="formData.barang_id"
          :items="availableItems"
          item-title="name"
          item-value="ID"
          placeholder="Pilih barang..."
          variant="outlined"
          density="comfortable"
          class="mb-2 enterprise-input"
          :rules="[v => !!v || 'Barang wajib dipilih']"
        ></v-autocomplete>

        <!-- Indikator Stok -->
        <v-expand-transition>
          <div v-if="selectedItemData" class="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
            <span class="text-sm font-medium text-blue-800">Stok Tersedia:</span>
            <span class="text-lg font-black text-blue-900">{{ selectedItemData.stok_tersedia }} Unit</span>
          </div>
        </v-expand-transition>

        <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah (Qty)</label>
        <div class="flex items-center gap-4 mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <v-btn icon="mdi-minus" variant="tonal" color="red-darken-1" size="large" class="rounded-xl" @click="formData.qty > 1 ? formData.qty-- : null"></v-btn>
          <input type="number" v-model="formData.qty" min="1" class="w-full text-center text-4xl font-black text-slate-800 bg-transparent focus:outline-none" />
          <v-btn icon="mdi-plus" variant="tonal" color="green-darken-1" size="large" class="rounded-xl" @click="formData.qty++"></v-btn>
        </div>

        <label class="block text-sm font-bold text-slate-700 mb-2">Kru Penerima</label>
        <v-autocomplete
          v-model="formData.penerima_id"
          :items="rosterStore.users"
          item-title="name"
          item-value="ID"
          placeholder="Ketik nama kru penerima..."
          variant="outlined"
          density="comfortable"
          class="mb-4 enterprise-input"
          :rules="[v => !!v || 'Penerima wajib dipilih']"
        ></v-autocomplete>

        <label class="block text-sm font-bold text-slate-700 mb-2">Keterangan / Lokasi</label>
        <v-textarea
          v-model="formData.keterangan"
          placeholder="Misal: Diserahkan di Checkpoint 2, kondisi lengkap."
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
          <span class="font-bold tracking-widest text-sm uppercase">Konfirmasi Serah Terima</span>
        </v-btn>

      </v-form>
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
import { useRosterStore } from '../stores/roster'
import { useTransactionStore } from '../stores/transaction'
import { useAuthStore } from '../stores/auth' // 👇 Tambahin AuthStore

const inventoryStore = useInventoryStore()
const rosterStore = useRosterStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore() // 👇 Panggil AuthStore

const form = ref<any>(null)
const formData = ref({
  barang_id: null,
  qty: 1,
  penerima_id: null,
  keterangan: ''
})

onMounted(async () => {
  await inventoryStore.fetchItems()
  await rosterStore.fetchUsers() 
})

const availableItems = computed(() => {
  return inventoryStore.items.filter(item => item.stok_tersedia > 0)
})

const selectedItemData = computed(() => {
  if (!formData.value.barang_id) return null
  return inventoryStore.items.find(i => i.ID === formData.value.barang_id)
})

const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color: type === 'success' ? 'green-darken-2' : 'red-darken-2', icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }
}

const submitHandover = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  if (selectedItemData.value && formData.value.qty > selectedItemData.value.stok_tersedia) {
    showNotif('Jumlah melebihi stok yang tersedia!', 'error')
    return
  }

  // 👇 UBAH PAYLOAD-NYA DI SINI SESUAI STRUCT GOLANG
  const payload = {
    barang_id: formData.value.barang_id!,
    qty: Number(formData.value.qty),
    from_user_id: authStore.user.id, // Otomatis ambil ID akun yang lagi login
    to_user_id: formData.value.penerima_id!,
    keterangan: formData.value.keterangan
  }

  const result = await transactionStore.processHandover(payload)

  if (result.success) {
    showNotif('Serah terima berhasil dicatat!', 'success')
    formData.value = { barang_id: null, qty: 1, penerima_id: null, keterangan: '' }
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
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none; margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
</style>