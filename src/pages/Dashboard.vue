<template>
  <div class="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen pb-20">
    
    <!-- HEADER DASHBOARD -->
    <div class="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <v-icon icon="mdi-monitor-dashboard" color="blue-darken-3"></v-icon>
          Pusat Kendali Operasional
        </h1>
        <p class="text-slate-500 font-medium mt-1 text-sm">Pemantauan logistik, pergerakan kru, dan peringatan stok secara real-time.</p>
      </div>
      <div class="flex items-center gap-3">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Update</p>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-xs font-black text-green-700">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- MAIN GRID LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- KOLOM KIRI (Lebar: 2 Bagian) -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- 1. RADAR PERSONEL -->
        <v-card elevation="0" class="rounded-[1.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 class="text-base font-black text-slate-800 uppercase tracking-wide">Radar Personel</h2>
            <v-chip size="small" color="blue-darken-3" class="font-bold">12 Aktif</v-chip>
          </div>
          <div class="p-6 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            
            <div v-for="crew in personnelRadar" :key="crew.id" class="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 hover:border-blue-300 transition-colors">
              <v-badge :color="crew.status === 'Tersedia' ? 'success' : 'warning'" dot location="bottom right" offset-x="3" offset-y="3">
                <v-avatar :color="crew.avatarColor" size="42" class="text-white font-bold">{{ crew.initials }}</v-avatar>
              </v-badge>
              <div class="flex-1 overflow-hidden">
                <h3 class="text-sm font-bold text-slate-800 truncate">{{ crew.name }}</h3>
                <p v-if="crew.status === 'Tersedia'" class="text-xs font-bold text-green-600 mt-0.5">Tersedia</p>
                <p v-else class="text-[10px] font-bold text-orange-600 mt-0.5 leading-tight truncate" :title="crew.currentTask">
                  Sedang di: {{ crew.currentTask }}
                </p>
              </div>
            </div>

          </div>
        </v-card>

        <!-- 2. TABEL BARANG BELUM KEMBALI -->
        <v-card elevation="0" class="rounded-[1.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 class="text-base font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <v-icon icon="mdi-clipboard-text-clock-outline" color="red-darken-2" size="20"></v-icon>
              Belum Kembali (On-Hand)
            </h2>
            <v-btn size="small" variant="text" color="blue-darken-3" class="font-bold">Lihat Semua</v-btn>
          </div>
          <v-data-table
            :headers="unreturnedHeaders"
            :items="unreturnedItems"
            :items-per-page="5"
            hover
            density="comfortable"
            class="aecurate-table hide-pagination"
          >
            <!-- Custom Unit Code -->
            <template #item.unitCode="{ item }">
              <span class="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">{{ item.unitCode }}</span>
            </template>
            <!-- Custom Borrower -->
            <template #item.borrower="{ item }">
              <span class="font-bold text-blue-900">{{ item.borrower }}</span>
              <span class="block text-[10px] text-slate-500 font-medium">{{ item.hub }}</span>
            </template>
            <!-- Custom Status/Time -->
            <template #item.timeBorrowed="{ item }">
              <span class="text-xs font-bold text-red-600 flex items-center gap-1">
                <v-icon icon="mdi-timer-sand" size="14"></v-icon> {{ item.timeBorrowed }}
              </span>
            </template>
            <!-- Custom Action -->
            <template #item.actions="{ item }">
              <v-btn size="x-small" color="blue-darken-3" variant="tonal" class="font-bold" prepend-icon="mdi-bell-ring-outline">
                Ingatkan
              </v-btn>
            </template>
          </v-data-table>
        </v-card>

      </div>

      <!-- KOLOM KANAN (Lebar: 1 Bagian) -->
      <div class="space-y-6">
        
        <!-- 3. SISTEM PERINGATAN STOK BERTIKAT -->
        <v-card elevation="0" class="rounded-[1.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
          <div class="px-6 py-4 border-b border-slate-100 bg-red-50/50">
            <h2 class="text-base font-black text-red-700 uppercase tracking-wide flex items-center gap-2">
              <v-icon icon="mdi-alert-octagon" color="red-darken-2" size="20"></v-icon>
              Peringatan Stok
            </h2>
          </div>
          <div class="p-4 space-y-3">
            
            <div v-for="alert in stockAlerts" :key="alert.id" 
              class="p-4 rounded-xl border relative overflow-hidden flex items-center gap-4"
              :class="{
                'bg-red-50 border-red-200': alert.status === 'Habis',
                'bg-orange-50 border-orange-200': alert.status === 'Kritis',
                'bg-yellow-50 border-yellow-200': alert.status === 'Menipis'
              }"
            >
              <!-- Icon Status -->
              <div class="p-2 rounded-lg"
                :class="{
                  'bg-red-100 text-red-600': alert.status === 'Habis',
                  'bg-orange-100 text-orange-600': alert.status === 'Kritis',
                  'bg-yellow-100 text-yellow-600': alert.status === 'Menipis'
                }"
              >
                <v-icon :icon="alert.status === 'Habis' ? 'mdi-close-octagon' : (alert.status === 'Kritis' ? 'mdi-alert' : 'mdi-alert-circle-outline')" size="24"></v-icon>
              </div>
              
              <!-- Info Detail -->
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <h3 class="text-sm font-bold text-slate-800 leading-tight">{{ alert.name }}</h3>
                  <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                    :class="{
                      'bg-red-600 text-white': alert.status === 'Habis',
                      'bg-orange-500 text-white': alert.status === 'Kritis',
                      'bg-yellow-400 text-yellow-900': alert.status === 'Menipis'
                    }"
                  >{{ alert.status }}</span>
                </div>
                <p class="text-xs font-semibold text-slate-500 mt-1">{{ alert.hub }}</p>
                <p class="text-sm font-black mt-1"
                   :class="alert.status === 'Habis' ? 'text-red-700' : 'text-slate-700'">
                  Sisa: {{ alert.stock }} <span class="text-xs font-medium text-slate-400">/ Batas: {{ alert.threshold }}</span>
                </p>
              </div>
            </div>

            <div v-if="stockAlerts.length === 0" class="text-center p-6">
              <v-icon icon="mdi-check-circle" color="green-lighten-2" size="48" class="mb-2"></v-icon>
              <p class="text-sm font-bold text-slate-500">Semua stok logistik dalam batas aman.</p>
            </div>
            
          </div>
        </v-card>

        <!-- 4. WIDGET PEMANTAUAN STOK PER LOKASI -->
        <v-card elevation="0" class="rounded-[1.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-white">
            <h2 class="text-base font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <v-icon icon="mdi-map-marker-multiple-outline" color="blue-darken-3" size="20"></v-icon>
              Volume Hub
            </h2>
          </div>
          <div class="p-6 bg-slate-50 space-y-4">
            
            <div v-for="hub in hubStocks" :key="hub.name" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div class="absolute right-0 top-0 h-full w-1" :class="hub.colorClass"></div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{{ hub.name }}</p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-black text-slate-800">{{ hub.totalItems }}</h3>
                <span class="text-sm font-bold text-slate-400">Items</span>
              </div>
              <!-- Mini Progress Bar Visual -->
              <div class="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div class="h-full rounded-full" :class="hub.colorClass" :style="`width: ${hub.percentage}%`"></div>
              </div>
            </div>

          </div>
        </v-card>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// --- WAKTU LIVE ---
const currentTime = ref(new Date().toLocaleTimeString('id-ID'))
let timer: any = null
onMounted(() => { timer = setInterval(() => { currentTime.value = new Date().toLocaleTimeString('id-ID') }, 1000) })
onUnmounted(() => { clearInterval(timer) })

// --- 1. DATA RADAR PERSONEL ---
const personnelRadar = ref([
  { id: 1, name: 'Taufik Rachman', initials: 'TR', avatarColor: 'blue-darken-4', status: 'Sibuk', currentTask: 'Loading Barang di Hub Utama' },
  { id: 2, name: 'Budi Santoso', initials: 'BS', avatarColor: 'teal-darken-3', status: 'Sibuk', currentTask: 'Antar HT ke Checkpoint 1' },
  { id: 3, name: 'Andi Pratama', initials: 'AP', avatarColor: 'orange-darken-3', status: 'Tersedia', currentTask: '' },
  { id: 4, name: 'Siti Aminah', initials: 'SA', avatarColor: 'purple-darken-3', status: 'Tersedia', currentTask: '' },
  { id: 5, name: 'Rizky Fadillah', initials: 'RF', avatarColor: 'indigo-darken-3', status: 'Sibuk', currentTask: 'Verifikasi Tenda' },
])

// --- 2. DATA BARANG BELUM KEMBALI (Sewa/Aset) ---
const unreturnedHeaders = [
  { title: 'NO. UNIT', key: 'unitCode', sortable: false },
  { title: 'BARANG', key: 'item', sortable: true },
  { title: 'PEMEGANG / LOKASI', key: 'borrower', sortable: true },
  { title: 'LAMA PINJAM', key: 'timeBorrowed', sortable: true },
  { title: 'AKSI', key: 'actions', sortable: false, align: 'end' }
]

const unreturnedItems = ref([
  { id: 1, unitCode: 'HT-045', item: 'HT Motorola', borrower: 'Divisi Acara', hub: 'Panggung Utama', timeBorrowed: '4 Jam lalu' },
  { id: 2, unitCode: 'TND-02', item: 'Tenda Sarnafil', borrower: 'Tim Medis', hub: 'Posko 1', timeBorrowed: '1 Hari lalu' },
  { id: 3, unitCode: 'HT-012', item: 'HT Motorola', borrower: 'Budi Santoso', hub: 'Mobile Unit', timeBorrowed: '5 Jam lalu' },
])

// --- 3. DATA PERINGATAN STOK BERTIKAT ---
// Logika: 0 = Habis, <= (threshold/2) = Kritis, <= threshold = Menipis
const stockAlerts = ref([
  { id: 1, name: 'Trash Bag Besar', hub: 'Checkpoint 1', stock: 0, threshold: 10, status: 'Habis' },
  { id: 2, name: 'Jas Hujan Ponco', hub: 'Gudang Utama', stock: 2, threshold: 10, status: 'Kritis' },
  { id: 3, name: 'Air Mineral Galon', hub: 'Drop Point Lembang', stock: 8, threshold: 10, status: 'Menipis' },
])

// --- 4. DATA PEMANTAUAN STOK PER HUB ---
const hubStocks = ref([
  { name: 'Gudang Utama ITB', totalItems: 1250, percentage: 85, colorClass: 'bg-blue-600' },
  { name: 'Checkpoint 1 (Jatinangor)', totalItems: 340, percentage: 45, colorClass: 'bg-orange-500' },
  { name: 'Drop Point (Lembang)', totalItems: 85, percentage: 15, colorClass: 'bg-teal-500' },
])
</script>

<style scoped>
/* Sembunyikan footer pagination di tabel "Belum Kembali" agar bersih */
:deep(.hide-pagination .v-data-table-footer) {
  display: none !important;
}
:deep(.v-data-table-header__content) {
  font-weight: 800 !important;
  color: #64748b !important;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}
</style>