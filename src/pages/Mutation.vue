<template>
  <div class="p-4 md:p-8 max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Mutasi Barang</h1>
      <p class="text-slate-500 font-medium text-sm mt-1">Pindahkan stok antar Hub atau alihkan tanggung jawab.</p>
    </div>

    <v-card elevation="0" class="rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-4 bg-orange-50 border-b border-orange-100 flex items-center gap-3">
        <v-icon icon="mdi-truck-fast-outline" color="orange-darken-3"></v-icon>
        <span class="font-bold text-orange-900">Form Pengalihan Logistik</span>
      </div>
      
      <div class="p-5 bg-white">
        <v-form @submit.prevent="submitMutation">
          
          <!-- Rute Pemindahan -->
          <div class="flex items-center gap-2 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dari (Asal)</label>
              <v-select v-model="form.origin" :items="hubs" variant="plain" density="compact" hide-details class="font-bold text-slate-800"></v-select>
            </div>
            <v-icon icon="mdi-arrow-right-bold" color="slate-300"></v-icon>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ke (Tujuan)</label>
              <v-select v-model="form.destination" :items="hubs" variant="plain" density="compact" hide-details class="font-bold text-slate-800"></v-select>
            </div>
          </div>

          <label class="block text-sm font-bold text-slate-700 mb-2">Barang yang Dipindahkan</label>
          <v-select
            v-model="form.item"
            :items="['HT Motorola', 'Trash Bag Besar', 'Tenda Sarnafil']"
            placeholder="Pilih Barang"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          ></v-select>

          <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah</label>
          <v-text-field v-model="form.qty" type="number" variant="outlined" density="comfortable" class="mb-4"></v-text-field>

          <label class="block text-sm font-bold text-slate-700 mb-2">Personel Pembawa (Kurir)</label>
          <v-select
            v-model="form.courier"
            :items="['Budi Santoso (Driver)', 'Andi Pratama (Crew)']"
            placeholder="Pilih Personel"
            variant="outlined"
            density="comfortable"
            class="mb-8"
          ></v-select>

          <v-btn block size="x-large" color="orange-darken-3" variant="flat" class="rounded-xl font-black tracking-widest shadow-lg shadow-orange-900/20" type="submit">
            PROSES MUTASI
          </v-btn>
        </v-form>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const hubs = ['Gudang Utama', 'Checkpoint 1', 'Drop Point Lembang']
const form = ref({ origin: 'Gudang Utama', destination: 'Checkpoint 1', item: null, qty: 1, courier: null })

const submitMutation = () => {
  if(!form.value.item || !form.value.courier) {
    alert('Harap lengkapi barang dan personel pembawa.')
    return
  }
  alert(`Mutasi ${form.value.qty} ${form.value.item} ke ${form.value.destination} sedang diproses.`)
}
</script>