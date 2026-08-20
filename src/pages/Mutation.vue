<template>
  <div class="p-4 md:p-8 max-w-2xl mx-auto pb-24">
    <div class="mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Mutasi Barang</h1>
      <p class="text-slate-500 font-medium text-sm mt-1">Pindahkan stok antar Hub atau alihkan tanggung jawab.</p>
    </div>

    <v-card elevation="0" class="rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-4 bg-orange-50 border-b border-orange-100 flex items-center gap-3">
        <v-icon icon="mdi-truck-fast-outline" color="orange-darken-3"></v-icon>
        <span class="font-bold text-orange-900">Form Pengalihan Logistik</span>
      </div>
      
      <div class="p-5 md:p-8 bg-white">
        <v-form ref="form" @submit.prevent="submitMutation">
          
          <label class="block text-sm font-bold text-slate-700 mb-2">Barang yang Dipindahkan</label>
          <v-autocomplete
            v-model="formData.barang_id"
            :items="availableItems"
            item-title="name"
            item-value="ID"
            placeholder="Pilih Barang..."
            variant="outlined"
            density="comfortable"
            class="mb-2 enterprise-input"
            :rules="[v => !!v || 'Barang wajib dipilih']"
          ></v-autocomplete>

          <!-- Rute Pemindahan (Otomatis & Manual) -->
          <v-expand-transition>
            <div v-if="selectedItemData" class="flex flex-col md:flex-row md:items-center gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="flex-1">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dari (Asal)</label>
                <!-- Otomatis terkunci ke Hub asal barang -->
                <p class="font-black text-slate-800 text-lg">{{ selectedItemData.hub?.name || 'Tidak Diketahui' }}</p>
                <p class="text-xs font-bold text-blue-600 mt-1">Stok: {{ selectedItemData.stok_tersedia }} Unit</p>
              </div>
              
              <v-icon icon="mdi-arrow-right-bold" color="slate-300" class="hidden md:block" size="24"></v-icon>
              <v-icon icon="mdi-arrow-down-bold" color="slate-300" class="md:hidden mx-auto" size="24"></v-icon>
              
              <div class="flex-1">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ke (Tujuan)</label>
                <v-select 
                  v-model="formData.to_hub_id" 
                  :items="filteredHubs" 
                  item-title="name"
                  item-value="ID"
                  placeholder="Pilih Hub Tujuan"
                  variant="outlined" 
                  density="compact" 
                  hide-details
                  class="font-bold text-slate-800 enterprise-input bg-white"
                  :rules="[v => !!v || 'Tujuan wajib dipilih']"
                ></v-select>
              </div>
            </div>
          </v-expand-transition>

          <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Mutasi</label>
          <div class="flex items-center gap-4 mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <v-btn icon="mdi-minus" variant="tonal" color="red-darken-1" size="large" class="rounded-xl" @click="formData.qty > 1 ? formData.qty-- : null"></v-btn>
            <input type="number" v-model="formData.qty" min="1" class="w-full text-center text-4xl font-black text-slate-800 bg-transparent focus:outline-none" />
            <v-btn icon="mdi-plus" variant="tonal" color="green-darken-1" size="large" class="rounded-xl" @click="formData.qty++"></v-btn>
          </div>

          <label class="block text-sm font-bold text-slate-700 mb-2">Personel Pembawa (Kurir)</label>
          <v-autocomplete
            v-model="formData.courier_id"
            :items="rosterStore.users"
            item-title="name"
            item-value="ID"
            placeholder="Siapa yang membawa barang ini?"
            variant="outlined"
            density="comfortable"
            class="mb-4 enterprise-input"
            :rules="[v => !!v || 'Kurir wajib dipilih']"
          ></v-autocomplete>

          <label class="block text-sm font-bold text-slate-700 mb-2">Catatan Mutasi</label>
          <v-textarea
            v-model="formData.keterangan"
            placeholder="Misal: Dikirim pakai mobil operasional."
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
            color="orange-darken-3" 
            variant="flat" 
            class="rounded-xl font-black tracking-widest shadow-lg shadow-orange-900/20 transform hover:-translate-y-0.5 transition-all" 
            :loading="transactionStore.isProcessing"
          >
            PROSES MUTASI
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
import { useHubStore } from '../stores/hubs'
import { useRosterStore } from '../stores/roster'
import { useTransactionStore } from '../stores/transaction'

const inventoryStore = useInventoryStore()
const hubStore = useHubStore()
const rosterStore = useRosterStore()
const transactionStore = useTransactionStore()

const form = ref<any>(null)
const formData = ref({
  barang_id: null,
  qty: 1,
  to_hub_id: null,
  courier_id: null,
  keterangan: ''
})

onMounted(async () => {
  await inventoryStore.fetchItems()
  await hubStore.fetchHubs()
  await rosterStore.fetchUsers()
})

// Hanya tampilkan barang yang punya stok
const availableItems = computed(() => {
  return inventoryStore.items.filter(item => item.stok_tersedia > 0)
})

const selectedItemData = computed(() => {
  if (!formData.value.barang_id) return null
  return inventoryStore.items.find(i => i.ID === formData.value.barang_id)
})

// Mencegah user memilih Hub asal sebagai Hub tujuan
const filteredHubs = computed(() => {
  if (!selectedItemData.value) return hubStore.hubs
  return hubStore.hubs.filter(h => h.ID !== selectedItemData.value.hub_id)
})

const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color: type === 'success' ? 'green-darken-2' : 'red-darken-2', icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }
}

const submitMutation = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  if (selectedItemData.value && formData.value.qty > selectedItemData.value.stok_tersedia) {
    showNotif('Jumlah mutasi melebihi stok yang ada!', 'error')
    return
  }

  // Cari nama kurir untuk diselipkan ke keterangan
  const courier = rosterStore.users.find(u => u.ID === formData.value.courier_id)
  const courierName = courier ? courier.name : 'Unknown'
  const fullKeterangan = `[Kurir: ${courierName}] ${formData.value.keterangan}`

  const payload = {
    barang_id: formData.value.barang_id!,
    qty: Number(formData.value.qty),
    from_hub_id: selectedItemData.value.hub_id,
    to_hub_id: formData.value.to_hub_id!,
    keterangan: fullKeterangan
  }

  const result = await transactionStore.processMutation(payload)

  if (result.success) {
    showNotif('Mutasi barang berhasil diproses!', 'success')
    // Reset form
    formData.value = { barang_id: null, qty: 1, to_hub_id: null, courier_id: null, keterangan: '' }
    await inventoryStore.fetchItems() // Refresh stok
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
  border-color: #f97316 !important; /* Orange focus color */
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
}
:deep(.v-field__outline) { display: none; }
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none; margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
</style>