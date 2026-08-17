<template>
  <div class="p-6 md:p-10 max-w-7xl mx-auto">
    <!-- Breadcrumb & Header -->
    <div class="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Katalog Barang</h1>
        <p class="text-slate-500 font-medium mt-1 text-sm">Kelola data master logistik, stok, dan sumber barang.</p>
      </div>
      
      <!-- Pindah posisi statistik mini ke header agar lebih interaktif -->
      <div class="flex gap-4">
        <div class="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <v-icon icon="mdi-package-variant" color="blue-darken-2"></v-icon>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Item</p>
            <p class="text-lg font-black text-slate-700 leading-none">{{ inventoryItems.length }}</p>
          </div>
        </div>
        <div class="bg-red-50 px-4 py-2 rounded-xl border border-red-100 shadow-sm flex items-center gap-3">
          <v-icon icon="mdi-alert-octagon-outline" color="red-darken-1"></v-icon>
          <div>
            <p class="text-[10px] font-bold text-red-400 uppercase tracking-wider">Stok Kritis</p>
            <p class="text-lg font-black text-red-600 leading-none">{{ criticalItemsCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Panggil Komponen Reusable Table -->
    <AecurateTable 
      title="Daftar Inventaris" 
      subtitle="Semua barang yang tercatat di sistem."
      :headers="tableHeaders" 
      :items="inventoryItems"
    >
      <!-- Tombol Aksi Tambah di Header (Enterprise Style) -->
      <template #header-actions>
        <v-btn 
          variant="flat" 
          prepend-icon="mdi-plus"
          class="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl"
          style="text-transform: none; font-weight: 700; letter-spacing: 0.5px;"
          @click="openDialog()"
        >
          Tambah Barang
        </v-btn>
      </template>

      <!-- Custom Kolom: Nama Barang dengan Icon -->
      <template #item.name="{ item }">
        <div class="flex items-center gap-3 py-2">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
            <v-icon icon="mdi-archive-outline" size="16" color="slate-500"></v-icon>
          </div>
          <span class="font-bold text-slate-700">{{ item.name }}</span>
        </div>
      </template>

      <!-- Custom Kolom: Sumber Barang (Chip Berwarna) -->
      <template #item.source="{ item }">
        <v-chip :color="getSourceColor(item.source)" size="small" class="font-bold uppercase text-[10px] tracking-wider" variant="tonal">
          {{ item.source }}
        </v-chip>
      </template>

      <!-- Custom Kolom: Status Stok (Kritis/Aman) -->
      <template #item.stock="{ item }">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="item.stock <= item.threshold ? 'bg-red-500 animate-pulse' : 'bg-green-500'"></div>
          <span class="font-bold" :class="item.stock <= item.threshold ? 'text-red-600' : 'text-slate-700'">
            {{ item.stock }}
          </span>
        </div>
      </template>

      <!-- Custom Kolom: Aksi (Edit & Delete) -->
      <template #item.actions="{ item }">
        <div class="flex gap-1 justify-end">
          <v-btn icon="mdi-pencil-outline" size="small" color="blue-darken-2" variant="text" @click="openDialog(item)"></v-btn>
          <v-btn icon="mdi-trash-can-outline" size="small" color="red-darken-2" variant="text" @click="deleteItem(item)"></v-btn>
        </div>
      </template>
    </AecurateTable>

    <!-- Modal Form Tambah/Edit (Enterprise Style) -->
    <v-dialog v-model="isDialogOpen" max-width="500" persistent>
      <v-card class="rounded-[1.5rem] shadow-2xl border border-slate-100">
        <v-card-title class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-50 rounded-lg">
              <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-plus-box'" color="blue-darken-2" size="20"></v-icon>
            </div>
            <span class="text-lg font-black text-slate-800">{{ isEditing ? 'Edit Data Barang' : 'Registrasi Barang Baru' }}</span>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" color="slate-400" @click="isDialogOpen = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="p-6 bg-slate-50">
          <v-form ref="form" @submit.prevent="saveItem">
            
            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Nama Barang</label>
              <v-text-field v-model="formData.name" placeholder="Misal: Trash Bag Hitam" variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-text-field>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Sumber Barang</label>
              <v-select v-model="formData.source" :items="['Milik Sendiri', 'Sewa', 'Sponsor', 'Pembelian']" placeholder="Pilih Sumber" variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-select>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Stok Awal</label>
                <v-text-field v-model="formData.stock" type="number" variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-text-field>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Batas Kritis</label>
                <v-text-field v-model="formData.threshold" type="number" variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" hint="Kirim notif jika stok = batas" persistent-hint class="enterprise-input"></v-text-field>
              </div>
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

    <!-- Snackbar Notifikasi (Toast) -->
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

// --- Notifikasi Snackbar ---
const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color: type === 'success' ? 'green-darken-2' : 'red-darken-2',
    icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
  }
}

// --- Definisi Kolom Tabel ---
const tableHeaders = [
  { title: 'KODE', key: 'code', sortable: true },
  { title: 'NAMA BARANG', key: 'name', sortable: true },
  { title: 'SUMBER', key: 'source', sortable: true },
  { title: 'STOK', key: 'stock', sortable: true },
  { title: 'BATAS KRITIS', key: 'threshold', sortable: false },
  { title: 'AKSI', key: 'actions', sortable: false, align: 'end' }
]

// --- Data Master Dummy ---
const inventoryItems = ref([
  { id: 1, code: 'ITM-001', name: 'HT Motorola', source: 'Sewa', stock: 45, threshold: 5 },
  { id: 2, code: 'ITM-002', name: 'Trash Bag Besar', source: 'Pembelian', stock: 10, threshold: 15 },
  { id: 3, code: 'ITM-003', name: 'Tenda Sarnafil 3x3', source: 'Sewa', stock: 8, threshold: 2 },
  { id: 4, code: 'ITM-004', name: 'Air Mineral Galon', source: 'Sponsor', stock: 50, threshold: 10 },
  { id: 5, code: 'ITM-005', name: 'Rompi Reflektor', source: 'Milik Sendiri', stock: 120, threshold: 20 },
])

// Computed property untuk menghitung stok kritis secara real-time
const criticalItemsCount = computed(() => {
  return inventoryItems.value.filter(item => item.stock <= item.threshold).length
})

// --- Logika Modal & Form CRUD ---
const isDialogOpen = ref(false)
const isEditing = ref(false)
const formData = ref<any>({ id: null, code: '', name: '', source: '', stock: 0, threshold: 0 })

const openDialog = (item: any = null) => {
  if (item) {
    isEditing.value = true
    formData.value = { ...item }
  } else {
    isEditing.value = false
    // Generate kode unik sederhana untuk dummy
    const newCode = `ITM-${String(inventoryItems.value.length + 1).padStart(3, '0')}`
    formData.value = { id: null, code: newCode, name: '', source: '', stock: 0, threshold: 0 }
  }
  isDialogOpen.value = true
}

const saveItem = () => {
  if (!formData.value.name || !formData.value.source) {
    showNotif('Nama dan Sumber barang wajib diisi!', 'error')
    return
  }

  // Konversi string inputan angka ke Number
  const payload = {
    ...formData.value,
    stock: Number(formData.value.stock),
    threshold: Number(formData.value.threshold)
  }

  if (isEditing.value) {
    // Update data array
    const index = inventoryItems.value.findIndex(i => i.id === payload.id)
    if (index !== -1) inventoryItems.value[index] = payload
    showNotif('Data barang berhasil diperbarui')
  } else {
    // Insert data baru ke array
    payload.id = Date.now()
    inventoryItems.value.push(payload)
    showNotif('Barang baru berhasil ditambahkan')
  }
  
  isDialogOpen.value = false
}

const deleteItem = (item: any) => {
  if (confirm(`Apakah Anda yakin ingin menghapus ${item.name}?`)) {
    inventoryItems.value = inventoryItems.value.filter(i => i.id !== item.id)
    showNotif(`${item.name} berhasil dihapus dari sistem`)
  }
}

// --- Helper Warna Chip Sumber ---
const getSourceColor = (source: string) => {
  const colors: Record<string, string> = {
    'Sewa': 'purple-darken-2',
    'Pembelian': 'blue-darken-2',
    'Sponsor': 'teal-darken-2',
    'Milik Sendiri': 'slate-600'
  }
  return colors[source] || 'grey'
}
</script>

<style scoped>
/* Menyamakan styling input form dengan Login Page */
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