<template>
  <div class="p-6 md:p-10 max-w-7xl mx-auto">
    <!-- Breadcrumb & Header -->
    <div class="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Lokasi Hub</h1>
        <p class="text-slate-500 font-medium mt-1 text-sm">Kelola titik operasional logistik ITB Ultra Marathon.</p>
      </div>
      
      <!-- Statistik Mini -->
      <div class="flex gap-4">
        <div class="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <v-icon icon="mdi-map-marker-multiple" color="blue-darken-2"></v-icon>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Titik</p>
            <p class="text-lg font-black text-slate-700 leading-none">
              <v-progress-circular v-if="hubStore.isLoading" indeterminate color="blue-darken-2" size="20"></v-progress-circular>
              <span v-else>{{ hubStore.hubs.length }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Panggil Komponen Reusable Table -->
    <AecurateTable 
      title="Daftar Lokasi Operasional" 
      subtitle="Titik hub logistik yang terdaftar di rute."
      :headers="tableHeaders" 
      :items="hubStore.hubs"
      :loading="hubStore.isLoading"
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

      <!-- Custom Kolom: Nama Lokasi (Ubah #item.Name jadi #item.name) -->
      <template #item.name="{ item }">
        <div class="flex items-center gap-3 py-2">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
            <v-icon icon="mdi-map-marker-radius" size="16" color="blue-darken-2"></v-icon>
          </div>
          <div>
            <span class="font-bold text-slate-700 block">{{ item.name }}</span>
          </div>
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
              <v-text-field 
                v-model="formData.name" 
                placeholder="Misal: Checkpoint 1 Jatinangor" 
                variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" 
                :rules="[v => !!v || 'Nama lokasi wajib diisi']"
                hide-details="auto" class="enterprise-input"
              ></v-text-field>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Detail Alamat / Patokan</label>
              <v-textarea 
                v-model="formData.address" 
                rows="2" 
                placeholder="Detail lokasi..." 
                variant="outlined" bg-color="#ffffff" color="blue-darken-2" density="comfortable" 
                :rules="[v => !!v || 'Alamat wajib diisi']"
                hide-details="auto" class="enterprise-input"
              ></v-textarea>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-4 border-t border-slate-100 bg-white">
          <v-spacer></v-spacer>
          <v-btn color="slate-600" variant="text" class="font-bold text-none px-4" @click="isDialogOpen = false" :disabled="isSaving">Batal</v-btn>
          <v-btn color="blue-darken-3" variant="flat" class="font-bold text-none px-6 rounded-lg shadow-md" @click="saveItem" :loading="isSaving">Simpan Data</v-btn>
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
import { ref, onMounted } from 'vue'
import AecurateTable from '../components/AecurateTable.vue'
import { useHubStore } from '../stores/hubs'

const hubStore = useHubStore()

onMounted(() => {
  hubStore.fetchHubs()
})

const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = {
    show: true, text,
    color: type === 'success' ? 'green-darken-2' : 'red-darken-2',
    icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
  }
}

// UBAH: Key disesuaikan dengan lowercase dari JSON
const tableHeaders = [
  { title: 'ID', key: 'ID', sortable: true }, // ID biasanya tetap uppercase di GORM
  { title: 'NAMA LOKASI', key: 'name', sortable: true },
  { title: 'ALAMAT', key: 'address', sortable: false },
  { title: 'AKSI', key: 'actions', sortable: false, align: 'end' }
]

const form = ref<any>(null)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const formData = ref<any>({ id: null, name: '', address: '' })

const openDialog = (item: any = null) => {
  if (item) {
    isEditing.value = true
    // UBAH: Gunakan huruf kecil untuk map data ke form
    formData.value = { id: item.ID, name: item.name, address: item.address }
  } else {
    isEditing.value = false
    formData.value = { id: null, name: '', address: '' }
  }
  isDialogOpen.value = true
}

const saveItem = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  isSaving.value = true
  let result;
  
  if (isEditing.value) {
    result = await hubStore.updateHub(formData.value.id, { name: formData.value.name, address: formData.value.address })
  } else {
    result = await hubStore.createHub({ name: formData.value.name, address: formData.value.address })
  }

  isSaving.value = false

  if (result.success) {
    showNotif(result.message, 'success')
    isDialogOpen.value = false
  } else {
    showNotif(result.message, 'error')
  }
}

const deleteItem = async (item: any) => {
  // UBAH: Gunakan item.name
  if (confirm(`Apakah Anda yakin ingin menghapus hub ${item.name}?`)) {
    const result = await hubStore.deleteHub(item.ID)
    if (result.success) {
      showNotif(result.message, 'success')
    } else {
      showNotif(result.message, 'error')
    }
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