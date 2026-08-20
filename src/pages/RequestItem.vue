<template>
  <div class="p-4 md:p-8 max-w-4xl mx-auto pb-24">
    <div class="mb-6 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Permintaan Barang</h1>
        <p class="text-slate-500 font-medium text-sm">Pilih barang yang dibutuhkan untuk divisi Anda.</p>
      </div>
      <v-progress-circular v-if="inventoryStore.isLoading" indeterminate color="blue-darken-2" size="24"></v-progress-circular>
    </div>

    <!-- Grid Barang Asli dari Database -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Hanya tampilkan barang yang stoknya lebih dari 0 -->
      <div v-for="item in availableItems" :key="item.ID" class="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm relative transition-all hover:shadow-md hover:border-blue-200">
        
        <div class="absolute top-2 right-2 bg-slate-100 text-[10px] font-bold px-2 py-1 rounded-md" :class="item.stok_tersedia <= item.threshold_stok ? 'text-red-600 bg-red-50' : 'text-slate-500'">
          Sisa: {{ item.stok_tersedia }}
        </div>
        
        <v-icon icon="mdi-package-variant-closed" size="40" color="slate-300" class="mb-2 mt-4"></v-icon>
        <h3 class="text-sm font-bold text-slate-700 leading-tight mb-4 h-8 flex items-center justify-center">{{ item.name }}</h3>
        
        <div v-if="getCartQty(item.ID) === 0">
          <v-btn block color="blue-lighten-5" class="text-blue-700 font-bold shadow-none border border-blue-100" elevation="0" @click="addToCart(item)">Minta</v-btn>
        </div>
        <div v-else class="flex justify-between items-center bg-blue-50 rounded-lg p-1 border border-blue-200">
          <v-btn icon="mdi-minus" size="x-small" variant="flat" color="white" class="text-blue-700 shadow-sm" @click="decreaseCart(item.ID)"></v-btn>
          <span class="font-black text-blue-900">{{ getCartQty(item.ID) }}</span>
          <v-btn icon="mdi-plus" size="x-small" variant="flat" color="blue-darken-2" class="shadow-sm" @click="addToCart(item)"></v-btn>
        </div>
      </div>

      <!-- Pesan jika tidak ada barang tersedia -->
      <div v-if="availableItems.length === 0 && !inventoryStore.isLoading" class="col-span-2 md:col-span-4 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <v-icon icon="mdi-package-variant-remove" size="40" color="slate-400" class="mb-2"></v-icon>
        <p class="text-slate-500 font-bold">Tidak ada barang dengan stok tersedia saat ini.</p>
      </div>
    </div>

    <!-- Floating Action Bar (Cart) -->
    <v-fade-transition>
      <div v-if="cart.length > 0" class="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_30px_rgb(0,0,0,0.05)] z-40 flex justify-between items-center">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase">Total Permintaan</p>
          <p class="text-xl font-black text-blue-700">{{ cart.length }} Jenis Barang</p>
        </div>
        <v-btn size="x-large" color="blue-darken-3" class="rounded-xl font-bold px-8 shadow-lg shadow-blue-900/20" @click="isCheckoutOpen = true">
          CHECKOUT
        </v-btn>
      </div>
    </v-fade-transition>

    <!-- Modal Form Checkout -->
    <v-dialog v-model="isCheckoutOpen" max-width="500" persistent z-index="9999">
      <v-card class="rounded-[1.5rem] shadow-2xl border border-slate-100">
        <v-card-title class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-50 rounded-lg">
              <v-icon icon="mdi-truck-delivery-outline" color="blue-darken-3" size="20"></v-icon>
            </div>
            <span class="text-lg font-black text-slate-800">Detail Pengiriman</span>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" color="slate-400" @click="isCheckoutOpen = false" :disabled="isProcessing"></v-btn>
        </v-card-title>
        
        <v-card-text class="p-6 bg-slate-50">
          <v-form ref="form" @submit.prevent="submitRequest">
            
            <div class="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100 mb-6">
              <p class="text-xs font-bold text-blue-800 mb-1">Rincian Barang:</p>
              <ul class="text-sm font-medium text-blue-900 list-disc pl-5">
                <li v-for="item in cart" :key="item.ID">{{ item.qty }}x {{ item.name }}</li>
              </ul>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Pihak Peminta (Divisi/Nama)</label>
              <v-text-field v-model="checkoutData.requestedBy" placeholder="Misal: Divisi Acara" variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input" :rules="[v => !!v || 'Wajib diisi']" :disabled="isProcessing"></v-text-field>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Lokasi Tujuan</label>
              <v-text-field v-model="checkoutData.location" placeholder="Misal: Tenda Medis Checkpoint 2" variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input" :rules="[v => !!v || 'Wajib diisi']" :disabled="isProcessing"></v-text-field>
            </div>

            <div class="mb-2">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Keterangan Tambahan</label>
              <v-textarea v-model="checkoutData.keterangan" rows="2" placeholder="Catatan opsional..." variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input" :disabled="isProcessing"></v-textarea>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-4 border-t border-slate-100 bg-white">
          <v-spacer></v-spacer>
          <v-btn color="slate-600" variant="text" class="font-bold text-none px-4" @click="isCheckoutOpen = false" :disabled="isProcessing">Batal</v-btn>
          <v-btn color="blue-darken-3" variant="flat" class="font-bold text-none px-6 rounded-lg shadow-md" @click="submitRequest" :loading="isProcessing">Kirim Permintaan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

onMounted(async () => {
  await inventoryStore.fetchItems()
})

// Hanya tampilkan barang yang stoknya lebih dari 0
const availableItems = computed(() => {
  return inventoryStore.items.filter(item => item.stok_tersedia > 0)
})

// --- Logika Keranjang (Cart) ---
const cart = ref<any[]>([])

const getCartQty = (id: number) => {
  const item = cart.value.find(i => i.ID === id)
  return item ? item.qty : 0
}

const addToCart = (item: any) => {
  const existing = cart.value.find(i => i.ID === item.ID)
  if (existing) {
    if(existing.qty < item.stok_tersedia) existing.qty++
  } else {
    cart.value.push({ ...item, qty: 1 })
  }
}

const decreaseCart = (id: number) => {
  const index = cart.value.findIndex(i => i.ID === id)
  if (index !== -1) {
    if (cart.value[index].qty > 1) {
      cart.value[index].qty--
    } else {
      cart.value.splice(index, 1)
    }
  }
}

// --- Logika Checkout & Submit API ---
const form = ref<any>(null)
const isCheckoutOpen = ref(false)
const isProcessing = ref(false)
const checkoutData = ref({
  requestedBy: '',
  location: '',
  keterangan: ''
})

const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color: type === 'success' ? 'green-darken-2' : 'red-darken-2', icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }
}

const submitRequest = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  isProcessing.value = true
  let successCount = 0
  let errorMsg = ''

  // Loop setiap item di cart dan kirim request ke API secara paralel
  const promises = cart.value.map(item => {
    return transactionStore.processRequest({
      barang_id: item.ID,
      qty: item.qty,
      requested_by: checkoutData.value.requestedBy,
      location: checkoutData.value.location,
      keterangan: checkoutData.value.keterangan
    })
  })

  const results = await Promise.all(promises)

  // Hitung berapa request yang sukses
  results.forEach(res => {
    if (res.success) successCount++
    else errorMsg = res.message
  })

  isProcessing.value = false

  if (successCount === cart.value.length) {
    showNotif('Semua permintaan berhasil dibuat dan masuk antrian!', 'success')
    cart.value = [] // Kosongkan keranjang
    isCheckoutOpen.value = false
    
    // Reset form
    checkoutData.value = { requestedBy: '', location: '', keterangan: '' }
    
    // Tarik ulang data stok agar UI terupdate
    await inventoryStore.fetchItems()
  } else {
    showNotif(`Gagal: ${errorMsg}`, 'error')
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
</style>