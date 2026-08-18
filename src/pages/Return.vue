<template>
  <div class="p-4 md:p-8 max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Pengembalian</h1>
      <p class="text-slate-500 font-medium text-sm mt-1">Daftar barang operasional yang menjadi tanggung jawab Anda saat ini.</p>
    </div>

    <!-- Tab Filter -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <v-chip color="blue-darken-3" variant="flat" class="font-bold">Belum Dikembalikan (2)</v-chip>
      <v-chip color="slate-300" variant="outlined" class="font-bold text-slate-600">Menunggu Verifikasi (1)</v-chip>
      <v-chip color="slate-300" variant="outlined" class="font-bold text-slate-600">Selesai (15)</v-chip>
    </div>

    <!-- List Barang On-Hand -->
    <div class="space-y-4">
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
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah</p>
            <p class="text-lg font-black text-blue-700">{{ item.qty }}</p>
          </div>
          <v-btn color="blue-darken-3" variant="tonal" class="rounded-lg font-bold" @click="openReturnDialog(item)">
            Kembalikan
          </v-btn>
        </div>
        
      </div>
    </div>

    <!-- Modal Konfirmasi Pengembalian -->
    <v-dialog v-model="isDialogOpenned" max-width="400" persistent>
      <v-card class="rounded-[1.5rem] p-4 text-center">
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <v-icon icon="mdi-keyboard-return" size="32"></v-icon>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">Kembalikan Barang?</h3>
        <p class="text-sm text-slate-500 mb-6">Anda akan mengembalikan <b>{{ selectedItem?.qty }} {{ selectedItem?.name }}</b> ke Hub Utama. Admin perlu memverifikasi ini.</p>
        
        <div class="flex gap-3">
          <v-btn flex-1 block variant="text" color="slate-500" class="font-bold" @click="isDialogOpenned = false">Batal</v-btn>
          <v-btn flex-1 block color="blue-darken-3" class="font-bold rounded-xl" @click="confirmReturn">Proses</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const onHandItems = ref([
  { id: 1, name: 'HT Motorola', qty: 3, borrowDate: 'Hari ini, 06:00' },
  { id: 2, name: 'Rompi Reflektor', qty: 5, borrowDate: 'Kemarin, 14:00' }
])

const isDialogOpenned = ref(false)
const selectedItem = ref<any>(null)

const openReturnDialog = (item: any) => {
  selectedItem.value = item
  isDialogOpenned.value = true
}

const confirmReturn = () => {
  alert(`Pengembalian ${selectedItem.value.name} dikirim. Menunggu verifikasi Admin Hub.`)
  onHandItems.value = onHandItems.value.filter(i => i.id !== selectedItem.value.id)
  isDialogOpenned.value = false
}
</script>