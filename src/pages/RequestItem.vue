<template>
  <div class="p-4 md:p-8 max-w-4xl mx-auto pb-24">
    <div class="mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Permintaan Barang</h1>
      <p class="text-slate-500 font-medium text-sm">Pilih barang yang dibutuhkan untuk divisi Anda.</p>
    </div>

    <!-- Grid Barang (Ketukan 1: Tap Plus Button) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="item in availableItems" :key="item.id" class="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm relative">
        <div class="absolute top-2 right-2 bg-slate-100 text-[10px] font-bold px-2 py-1 rounded-md text-slate-500">Sisa: {{ item.stock }}</div>
        <v-icon icon="mdi-package-variant-closed" size="40" color="slate-300" class="mb-2 mt-4"></v-icon>
        <h3 class="text-sm font-bold text-slate-700 leading-tight mb-4 h-8">{{ item.name }}</h3>
        
        <div v-if="getCartQty(item.id) === 0">
          <v-btn block color="blue-lighten-5" class="text-blue-700 font-bold shadow-none border border-blue-100" elevation="0" @click="addToCart(item)">Minta</v-btn>
        </div>
        <div v-else class="flex justify-between items-center bg-blue-50 rounded-lg p-1 border border-blue-200">
          <v-btn icon="mdi-minus" size="x-small" variant="flat" color="white" class="text-blue-700 shadow-sm" @click="decreaseCart(item.id)"></v-btn>
          <span class="font-black text-blue-900">{{ getCartQty(item.id) }}</span>
          <v-btn icon="mdi-plus" size="x-small" variant="flat" color="blue-darken-2" class="shadow-sm" @click="addToCart(item)"></v-btn>
        </div>
      </div>
    </div>

    <!-- Floating Action Bar (Ketukan 2 & 3: Review & Submit) -->
    <v-fade-transition>
      <div v-if="cart.length > 0" class="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_30px_rgb(0,0,0,0.05)] z-50 flex justify-between items-center">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase">Total Permintaan</p>
          <p class="text-xl font-black text-blue-700">{{ cart.length }} Jenis Barang</p>
        </div>
        <v-btn size="x-large" color="blue-darken-3" class="rounded-xl font-bold px-8 shadow-lg shadow-blue-900/20" @click="submitRequest">
          KIRIM PERMINTAAN
        </v-btn>
      </div>
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const availableItems = ref([
  { id: 1, name: 'HT Motorola', stock: 45 },
  { id: 2, name: 'Trash Bag Besar', stock: 10 },
  { id: 3, name: 'Tenda Sarnafil', stock: 8 },
  { id: 4, name: 'Air Mineral', stock: 50 },
])

const cart = ref<any[]>([])

const getCartQty = (id: number) => {
  const item = cart.value.find(i => i.id === id)
  return item ? item.qty : 0
}

const addToCart = (item: any) => {
  const existing = cart.value.find(i => i.id === item.id)
  if (existing) {
    if(existing.qty < item.stock) existing.qty++
  } else {
    cart.value.push({ ...item, qty: 1 })
  }
}

const decreaseCart = (id: number) => {
  const index = cart.value.findIndex(i => i.id === id)
  if (index !== -1) {
    if (cart.value[index].qty > 1) {
      cart.value[index].qty--
    } else {
      cart.value.splice(index, 1)
    }
  }
}

const submitRequest = () => {
  alert('Permintaan berhasil dikirim ke antrian logistik!')
  cart.value = []
}
</script>