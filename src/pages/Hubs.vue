<template>
  <div class="p-6 md:p-10 max-w-7xl mx-auto">
    <!-- Breadcrumb & Header -->
    <div class="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Lokasi Hub</h1>
        <p class="text-slate-500 font-medium mt-1 text-sm">Kelola titik operasional, checkpoint, dan status aktif hub.</p>
      </div>
      
      <!-- Statistik Mini -->
      <div class="flex gap-4">
        <div class="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <v-icon icon="mdi-map-marker-multiple" color="blue-darken-2"></v-icon>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Titik</p>
            <p class="text-lg font-black text-slate-700 leading-none">{{ hubItems.length }}</p>
          </div>
        </div>
        <div class="bg-green-50 px-4 py-2 rounded-xl border border-green-100 shadow-sm flex items-center gap-3">
          <v-icon icon="mdi-check-circle-outline" color="green-darken-1"></v-icon>
          <div>
            <p class="text-[10px] font-bold text-green-500 uppercase tracking-wider">Hub Aktif</p>
            <p class="text-lg font-black text-green-700 leading-none">{{ activeHubsCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Panggil Komponen Reusable Table -->
    <AecurateTable 
      title="Daftar Lokasi Operasional" 
      subtitle="Titik hub logistik yang terdaftar di rute."
      :headers="tableHeaders" 
      :items="hubItems"
    >
      <template #header-actions>
        <v-btn 
          variant="flat" 
          prepend-icon="mdi-plus"
          class="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl"
          style="text-transform: none; font-weight: 700; letter-spacing: 0.5px;"
          @click="openDialog()"
        >
          Tambah Titik
        </v-btn>
      </template>

      <!-- Custom Kolom: Nama Lokasi -->
      <template #item.name="{ item }">
        <div class="flex items-center gap-3 py-2">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
            <v-icon icon="mdi-map-marker-radius" size="16" color="blue-darken-2"></v-icon>
          </div>
          <div>
            <span class="font-bold text-slate-700 block">{{ item.name }}</span>
            <span class="text-[10px] text-slate-400 font-medium">{{ item.address }}</span>
          </div>
        </div>
      </template>

      <!-- Custom Kolom: Tipe Hub -->
      <template #item.type="{ item }">
        <v-chip :color="getTypeColor(item.type)" size="small" class="font-bold uppercase text-[10px] tracking-wider" variant="tonal">
          {{ item.type }}
        </v-chip>
      </template>

      <!-- Custom Kolom: Status Aktif -->
      <template #item.status="{ item }">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="item.status === 'Aktif' ? 'bg-green-500' : 'bg-slate-300'"></div>
          <span class="font-bold" :class="item.status === 'Aktif' ? 'text-green-700' : 'text-slate-500'">
            {{ item.status }}
          </span>
        </div>
      </template>

      <!-- Custom Kolom: Aksi -->
      <template #item.actions="{ item }">
        <div class="flex gap-1 justify-end">
          <v-btn icon="mdi-pencil-outline" size="small" color="blue-darken-2" variant="text" @click="openDialog(item)"></v-btn>
          <v-btn icon="mdi-trash-can-outline" size="small" color="red-darken-2" variant="text" @click="deleteItem(item)"></v-btn>
        </div>
      </template>
    </AecurateTable>

    <!-- Modal Form Tambah/Edit -->
    <v-dialog v-model="isDialogOpen" max-width="500" persistent>
      <v-card class="rounded-[1.5rem] shadow-2xl border border-slate-100">
        <v-card-title class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-50 rounded-lg">
              <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-map-marker-plus'" color="blue-darken-2" size="20"></v-icon>
            </div>
            <span class="text-lg font-black text-slate-800">{{ isEditing ? 'Edit Data Hub' : 'Registrasi Titik Baru' }}</span>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" color="slate-400" @click="isDialogOpen = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="p-6 bg-slate-50">
          <v-form ref="form" @submit.prevent="saveItem">
            
            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Nama Lokasi</label>
              <v-text-field v-model="formData.name" placeholder="Misal: Checkpoint 1 Jatinangor" variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-text-field>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Tipe Titik</label>
              <v-select v-model="formData.type" :items="['Main Hub', 'Checkpoint', 'Drop Point', 'Mobile Unit']" placeholder="Pilih Tipe" variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Detail Alamat / Patokan</label>
              <v-textarea v-model="formData.address" rows="2" placeholder="Detail lokasi..." variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-textarea>
            </div>

            <div class="mb-2 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <p class="text-sm font-bold text-slate-700">Status Operasional</p>
                <p class="text-xs text-slate-500">Tentukan apakah titik ini sedang aktif digunakan.</p>
              </div>
              <v-switch v-model="formData.status" true-value="Aktif" false-value="Nonaktif" color="success" hide-details density="compact" inset></v-switch>
            </div>

          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-4 border-t border-slate-100 bg-white">
          <v-spacer></v-spacer>
          <v-btn color="slate-600" variant="text" class="font-bold text-none px-4" @click="isDialogOpen = false">Batal</v-btn>
          <v-btn color="blue-darken-3" variant="flat" class="font-bold text-none px-6 rounded-lg shadow-md" @click="saveItem">Simpan Data</v-btn>
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
import { ref, computed } from 'vue'
import AecurateTable from '../components/AecurateTable.vue'

// --- Notifikasi ---
const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = {
    show: true, text,
    color: type === 'success' ? 'green-darken-2' : 'red-darken-2',
    icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
  }
}

// --- Definisi Kolom ---
const tableHeaders = [
  { title: 'KODE', key: 'code', sortable: true },
  { title: 'NAMA LOKASI', key: 'name', sortable: true },
  { title: 'TIPE', key: 'type', sortable: true },
  { title: 'STATUS', key: 'status', sortable: true },
  { title: 'AKSI', key: 'actions', sortable: false, align: 'end' }
]

// --- Data Dummy ---
const hubItems = ref([
  { id: 1, code: 'HUB-001', name: 'Gudang Utama ITB', address: 'Jl. Ganesha No.10', type: 'Main Hub', status: 'Aktif' },
  { id: 2, code: 'CP-001', name: 'Checkpoint 1 - Jatinangor', address: 'Kampus ITB Jatinangor', type: 'Checkpoint', status: 'Aktif' },
  { id: 3, code: 'DP-001', name: 'Drop Point Lembang', address: 'Alun-alun Lembang', type: 'Drop Point', status: 'Nonaktif' },
])

const activeHubsCount = computed(() => hubItems.value.filter(h => h.status === 'Aktif').length)

// --- Logika Form ---
const isDialogOpen = ref(false)
const isEditing = ref(false)
const formData = ref<any>({ id: null, code: '', name: '', type: '', address: '', status: 'Aktif' })

const openDialog = (item: any = null) => {
  if (item) {
    isEditing.value = true
    formData.value = { ...item }
  } else {
    isEditing.value = false
    const newCode = `HUB-${String(hubItems.value.length + 1).padStart(3, '0')}`
    formData.value = { id: null, code: newCode, name: '', type: '', address: '', status: 'Aktif' }
  }
  isDialogOpen.value = true
}

const saveItem = () => {
  if (!formData.value.name || !formData.value.type) {
    showNotif('Nama dan Tipe Lokasi wajib diisi!', 'error')
    return
  }

  if (isEditing.value) {
    const index = hubItems.value.findIndex(i => i.id === formData.value.id)
    if (index !== -1) hubItems.value[index] = { ...formData.value }
    showNotif('Data hub berhasil diperbarui')
  } else {
    formData.value.id = Date.now()
    hubItems.value.push({ ...formData.value })
    showNotif('Titik hub baru berhasil ditambahkan')
  }
  isDialogOpen.value = false
}

const deleteItem = (item: any) => {
  if (confirm(`Apakah Anda yakin ingin menghapus ${item.name}?`)) {
    hubItems.value = hubItems.value.filter(i => i.id !== item.id)
    showNotif(`${item.name} berhasil dihapus dari sistem`)
  }
}

// --- Helper Warna Chip ---
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'Main Hub': 'blue-darken-3',
    'Checkpoint': 'orange-darken-3',
    'Drop Point': 'purple-darken-2',
    'Mobile Unit': 'teal-darken-3'
  }
  return colors[type] || 'grey'
}
</script>

<style scoped>
:deep(.v-field) {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
:deep(.v-field:hover) {
  border-color: #cbd5e1;
}
:deep(.v-field--focused) {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}
:deep(.v-field__outline) {
  display: none; 
}
</style>