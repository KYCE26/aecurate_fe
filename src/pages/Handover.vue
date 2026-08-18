<template>
  <div class="p-4 md:p-8 max-w-md mx-auto">
    <div class="text-center mb-6">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Serah Terima Barang</h1>
      <p class="text-slate-500 font-medium text-sm mt-1">Sistem pemindahan tanggung jawab logistik.</p>
    </div>

    <!-- Toggle Penyerah / Penerima -->
    <v-tabs v-model="tab" color="blue-darken-3" align-tabs="center" bg-color="slate-100" class="rounded-xl mb-6 p-1">
      <v-tab value="send" class="rounded-lg font-bold">Saya Menyerahkan</v-tab>
      <v-tab value="receive" class="rounded-lg font-bold">Saya Menerima</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="overflow-visible">
      
      <!-- MODE: PENYERAH -->
      <v-window-item value="send">
        <v-card elevation="0" class="p-6 rounded-[1.5rem] border border-slate-200 text-center">
          <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-100">
            <v-icon icon="mdi-qrcode-scan" size="36" color="blue-darken-3"></v-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">Buat Kode Serah Terima</h3>
          <p class="text-sm text-slate-500 mb-6">Pilih tugas/barang yang akan diserahkan, lalu tunjukkan kode QR ke penerima.</p>
          <v-btn block size="large" color="slate-800" class="rounded-xl font-bold text-none">Buat Kode QR</v-btn>
        </v-card>
      </v-window-item>

      <!-- MODE: PENERIMA -->
      <v-window-item value="receive">
        <v-card elevation="0" class="p-6 rounded-[1.5rem] border border-slate-200">
          <p class="text-sm font-bold text-slate-700 mb-2 text-center">Masukkan Kode / Scan QR Penyerah</p>
          <v-text-field v-model="transactionId" placeholder="Misal: TRX-8829" variant="outlined" density="comfortable" class="mb-4" hide-details></v-text-field>
          <v-btn block size="large" color="slate-200" variant="flat" class="text-slate-700 rounded-xl font-bold mb-6" @click="cekTransaksi">Cari Data</v-btn>

          <!-- Tampil Jika Transaksi Ditemukan -->
          <div v-if="showVerification" class="p-4 bg-orange-50 border border-orange-200 rounded-xl relative overflow-hidden">
            <div class="absolute top-0 right-0 p-2 opacity-10">
               <v-icon icon="mdi-shield-check" size="80"></v-icon>
            </div>
            <p class="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Verifikasi Barang</p>
            <h4 class="font-black text-slate-800 text-lg mb-1">TRX-8829</h4>
            <p class="text-sm text-slate-600 font-medium mb-4">Dari: Taufik Rachman (Gudang Utama)</p>
            
            <ul class="text-sm font-bold text-slate-800 space-y-2 mb-6">
              <li class="flex justify-between border-b border-orange-100 pb-1"><span>HT Motorola</span> <span>x5</span></li>
              <li class="flex justify-between border-b border-orange-100 pb-1"><span>Trash Bag</span> <span>x10</span></li>
            </ul>

            <v-btn block size="x-large" color="green-darken-2" class="rounded-xl font-black tracking-widest shadow-lg shadow-green-900/20" @click="konfirmasiTerima">
              KONFIRMASI DITERIMA
            </v-btn>
          </div>
        </v-card>
      </v-window-item>

    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tab = ref('send')
const transactionId = ref('')
const showVerification = ref(false)

const cekTransaksi = () => {
  if(transactionId.value) showVerification.value = true
}

const konfirmasiTerima = () => {
  alert('Barang resmi berpindah tangan ke Anda!')
  showVerification.value = false
  transactionId.value = ''
}
</script>