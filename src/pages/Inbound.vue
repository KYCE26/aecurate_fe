<template>
  <div class="p-4 md:p-8 max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Barang Masuk (Inbound)</h1>
      <p class="text-slate-500 font-medium mt-1 text-sm">Registrasi stok awal atau tambahan ke Hub.</p>
    </div>

    <v-card elevation="0" class="rounded-[1.5rem] border border-slate-200 overflow-hidden">
      <div class="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
        <v-icon icon="mdi-barcode-scan" color="blue-darken-3"></v-icon>
        <span class="font-bold text-blue-900">Scan / Input Manual</span>
      </div>
      
      <div class="p-5">
        <v-form @submit.prevent="submitInbound">
          <label class="block text-sm font-bold text-slate-700 mb-2">Pilih Barang</label>
          <v-autocomplete
            v-model="selectedItem"
            :items="masterItems"
            item-title="name"
            item-value="id"
            placeholder="Ketik nama barang..."
            variant="outlined"
            density="comfortable"
            class="mb-4"
          ></v-autocomplete>

          <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Masuk</label>
          <div class="flex items-center gap-4 mb-6">
            <v-btn icon="mdi-minus" variant="tonal" color="red-darken-1" @click="qty > 1 ? qty-- : null"></v-btn>
            <input type="number" v-model="qty" class="w-full text-center text-3xl font-black text-slate-800 focus:outline-none" />
            <v-btn icon="mdi-plus" variant="tonal" color="green-darken-1" @click="qty++"></v-btn>
          </div>

          <label class="block text-sm font-bold text-slate-700 mb-2">Lokasi Simpan (Hub)</label>
          <v-select
            v-model="selectedHub"
            :items="['Gudang Utama ITB', 'Checkpoint 1', 'Drop Point Lembang']"
            variant="outlined"
            density="comfortable"
            class="mb-8"
          ></v-select>

          <v-btn block size="x-large" color="blue-darken-3" variant="flat" class="rounded-xl font-bold tracking-widest" @click="submitInbound">
            SIMPAN BARANG MASUK
          </v-btn>
        </v-form>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const masterItems = ref([
  { id: 1, name: 'HT Motorola' },
  { id: 2, name: 'Trash Bag Besar' },
  { id: 3, name: 'Air Mineral Galon' }
])
const selectedItem = ref(null)
const selectedHub = ref('Gudang Utama ITB')
const qty = ref(1)

const submitInbound = () => {
  alert(`Berhasil! ${qty.value} item didaftarkan ke ${selectedHub.value}.`)
  qty.value = 1
  selectedItem.value = null
}
</script>