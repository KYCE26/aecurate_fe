<template>
  <div class="p-6 md:p-10 max-w-7xl mx-auto">
    <!-- Header & Progress 1.043 Jam -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Roster & Jam Kerja</h1>
          <p class="text-slate-500 font-medium mt-1 text-sm">Pantau jadwal shift dan akumulasi 1.043 jam operasional.</p>
        </div>
        
        <v-btn 
          variant="flat" 
          prepend-icon="mdi-clock-plus-outline"
          class="bg-gradient-to-r from-indigo-600 to-blue-800 text-white shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl h-12 px-6"
          style="text-transform: none; font-weight: 700; letter-spacing: 0.5px;"
          @click="openDialog()"
        >
          Catat Jam Kerja
        </v-btn>
      </div>

      <!-- Enterprise Progress Bar Widget -->
      <div class="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div class="flex justify-between items-end mb-3">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Akumulasi Jam Operasional</p>
            <h2 class="text-3xl font-black text-slate-800"><span class="text-blue-600">{{ totalLoggedHours }}</span> <span class="text-lg text-slate-400 font-medium">/ 1.043 Jam</span></h2>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-blue-600">{{ progressPercentage }}% Terpenuhi</p>
          </div>
        </div>
        <!-- Vuetify Progress Linear dengan kustomisasi -->
        <v-progress-linear
          :model-value="progressPercentage"
          color="blue-darken-2"
          height="12"
          rounded
          bg-color="slate-100"
        ></v-progress-linear>
      </div>
    </div>

    <!-- Timeline Board / Jadwal Harian -->
    <div class="bg-white border border-slate-200 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="text-lg font-bold text-slate-800">Timeline Shift Hari Ini</h3>
        <p class="text-sm font-semibold text-slate-500">{{ currentDate }}</p>
      </div>

      <!-- List Personel & Visual Timeline -->
      <div class="divide-y divide-slate-100">
        <div v-for="crew in rosterData" :key="crew.id" class="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-6">
          
          <!-- Profil Personel (Kolom Kiri) -->
          <div class="flex items-center gap-4 md:w-1/4">
            <v-avatar :color="crew.avatarColor" size="48" class="text-white font-bold shadow-sm">
              {{ crew.initials }}
            </v-avatar>
            <div>
              <p class="font-bold text-slate-800 leading-tight">{{ crew.name }}</p>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{{ crew.role }}</p>
            </div>
          </div>

          <!-- Timeline Blocks (Kolom Kanan) -->
          <div class="flex-1 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <template v-for="(shift, idx) in crew.shifts" :key="idx">
              <!-- Balok Shift Kerja -->
              <div v-if="shift.type === 'Kerja'" class="flex-shrink-0 flex items-center bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 border-l-4 border-l-blue-500">
                <v-icon icon="mdi-briefcase-outline" size="14" color="blue-darken-2" class="mr-2"></v-icon>
                <span class="text-sm font-bold text-blue-900">{{ shift.start }} - {{ shift.end }}</span>
              </div>
              
              <!-- Balok Waktu Istirahat -->
              <div v-if="shift.type === 'Istirahat'" class="flex-shrink-0 flex items-center bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 border-l-4 border-l-orange-400">
                <v-icon icon="mdi-food-apple-outline" size="14" color="orange-darken-3" class="mr-2"></v-icon>
                <span class="text-sm font-bold text-orange-900">{{ shift.start }} - {{ shift.end }}</span>
              </div>
            </template>

            <!-- Tanda jika belum ada jadwal -->
            <div v-if="crew.shifts.length === 0" class="text-sm font-medium text-slate-400 italic">
              Belum ada log aktivitas.
            </div>
          </div>
          
          <!-- Tombol Aksi Cepat -->
          <div class="md:w-auto text-right">
            <v-btn icon="mdi-plus-circle-outline" variant="text" color="slate-400" @click="openDialog(crew.id)"></v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Input Jam -->
    <v-dialog v-model="isDialogOpen" max-width="500" persistent>
      <v-card class="rounded-[1.5rem] shadow-2xl border border-slate-100">
        <v-card-title class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-50 rounded-lg">
              <v-icon icon="mdi-clock-edit-outline" color="indigo-darken-2" size="20"></v-icon>
            </div>
            <span class="text-lg font-black text-slate-800">Catat Jam Aktivitas</span>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" color="slate-400" @click="isDialogOpen = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="p-6 bg-slate-50">
          <v-form ref="form" @submit.prevent="saveLog">
            
            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Pilih Personel</label>
              <v-select v-model="formData.crewId" :items="crewListOptions" item-title="name" item-value="id" placeholder="Siapa yang bertugas?" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Jenis Aktivitas</label>
              <v-radio-group v-model="formData.type" inline hide-details class="mb-2">
                <v-radio label="Kerja / Shift" value="Kerja" color="blue-darken-2"></v-radio>
                <v-radio label="Istirahat" value="Istirahat" color="orange-darken-2"></v-radio>
              </v-radio-group>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Jam Mulai</label>
                <v-text-field v-model="formData.start" type="time" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-text-field>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Jam Selesai</label>
                <v-text-field v-model="formData.end" type="time" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-text-field>
              </div>
            </div>

            <div class="mb-2">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Keterangan (Opsional)</label>
              <v-text-field v-model="formData.notes" placeholder="Misal: Loading barang di Hub Utama" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-text-field>
            </div>

          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-4 border-t border-slate-100 bg-white">
          <v-spacer></v-spacer>
          <v-btn color="slate-600" variant="text" class="font-bold text-none px-4" @click="isDialogOpen = false">Batal</v-btn>
          <v-btn color="indigo-darken-3" variant="flat" class="font-bold text-none px-6 rounded-lg shadow-md" @click="saveLog">Simpan Log</v-btn>
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

// Format Tanggal Hari Ini
const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
const currentDate = new Date().toLocaleDateString('id-ID', dateOptions)

// --- State & Data ---
const targetHours = 1043
const totalLoggedHours = ref(428) // Dummy data awal
const progressPercentage = computed(() => ((totalLoggedHours.value / targetHours) * 100).toFixed(1))

const rosterData = ref([
  { id: 1, name: 'Taufik Rachman', role: 'Koordinator', initials: 'TR', avatarColor: 'blue-darken-4', shifts: [{ type: 'Kerja', start: '06:00', end: '14:00' }, { type: 'Istirahat', start: '12:00', end: '13:00' }] },
  { id: 2, name: 'Budi Santoso', role: 'Driver', initials: 'BS', avatarColor: 'teal-darken-3', shifts: [{ type: 'Kerja', start: '08:00', end: '16:00' }] },
  { id: 3, name: 'Andi Pratama', role: 'Crew Gudang', initials: 'AP', avatarColor: 'orange-darken-3', shifts: [] },
])

const crewListOptions = computed(() => rosterData.value.map(c => ({ id: c.id, name: c.name })))

// --- Logika Form ---
const isDialogOpen = ref(false)
const formData = ref({ crewId: null, type: 'Kerja', start: '', end: '', notes: '' })

const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string) => {
  snackbar.value = { show: true, text, color: 'green-darken-2', icon: 'mdi-check-circle' }
}

const openDialog = (prefillCrewId: any = null) => {
  formData.value = { crewId: prefillCrewId, type: 'Kerja', start: '', end: '', notes: '' }
  isDialogOpen.value = true
}

const saveLog = () => {
  if (!formData.value.crewId || !formData.value.start || !formData.value.end) {
    alert("Lengkapi data yang wajib (Personel, Jam Mulai, Jam Selesai)")
    return
  }

  // Masukkan log ke dalam data personel yang dipilih
  const crewIndex = rosterData.value.findIndex(c => c.id === formData.value.crewId)
  if (crewIndex !== -1) {
    rosterData.value[crewIndex].shifts.push({
      type: formData.value.type,
      start: formData.value.start,
      end: formData.value.end
    })
    
    // Urutkan jadwal berdasarkan jam mulai agar rapi
    rosterData.value[crewIndex].shifts.sort((a, b) => a.start.localeCompare(b.start))
  }

  // Simulasi penambahan jam total operasional (+4 jam setiap kali log kerja disimpan)
  if (formData.value.type === 'Kerja') {
    totalLoggedHours.value += 4 
  }

  showNotif(`Log aktivitas berhasil dicatat`)
  isDialogOpen.value = false
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
  border-color: #4f46e5 !important; /* Indigo focus color */
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}
:deep(.v-field__outline) {
  display: none; 
}
</style>