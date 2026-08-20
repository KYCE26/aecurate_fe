<template>
  <div class="p-6 md:p-10 max-w-7xl mx-auto">
    <!-- Header & Progress -->
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
        <v-progress-linear :model-value="progressPercentage" color="blue-darken-2" height="12" rounded bg-color="slate-100"></v-progress-linear>
      </div>
    </div>

    <!-- Timeline Board / Jadwal Harian -->
    <div class="bg-white border border-slate-200 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="text-lg font-bold text-slate-800">Timeline Shift Hari Ini</h3>
        <p class="text-sm font-semibold text-slate-500">{{ currentDate }}</p>
      </div>

      <div v-if="rosterStore.isLoading" class="p-10 text-center">
        <v-progress-circular indeterminate color="indigo-darken-2"></v-progress-circular>
      </div>

      <!-- List Personel & Visual Timeline -->
      <div v-else class="divide-y divide-slate-100">
        <div v-for="crew in groupedRosterData" :key="crew.id" class="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-6">
          
          <div class="flex items-center gap-4 md:w-1/4">
            <v-avatar :color="crew.avatarColor" size="48" class="text-white font-bold shadow-sm">
              {{ crew.initials }}
            </v-avatar>
            <div>
              <p class="font-bold text-slate-800 leading-tight">{{ crew.name }}</p>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{{ crew.role }}</p>
            </div>
          </div>

          <!-- Timeline Blocks (Dibuat Clickable) -->
          <div class="flex-1 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <template v-for="(shift, idx) in crew.shifts" :key="idx">
              
              <div v-if="shift.type === 'Kerja'" @click="editShift(shift)" class="cursor-pointer hover:bg-blue-100 transition-colors flex-shrink-0 flex flex-col justify-center bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 border-l-4 border-l-blue-500" title="Klik untuk edit">
                <div class="flex items-center">
                  <v-icon icon="mdi-briefcase-outline" size="14" color="blue-darken-2" class="mr-2"></v-icon>
                  <span class="text-sm font-bold text-blue-900">{{ shift.start }} - {{ shift.end }}</span>
                </div>
                <span class="text-[10px] text-blue-700 font-medium mt-0.5">{{ shift.hubName }}</span>
              </div>
              
              <div v-if="shift.type === 'Istirahat'" @click="editShift(shift)" class="cursor-pointer hover:bg-orange-100 transition-colors flex-shrink-0 flex items-center bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 border-l-4 border-l-orange-400" title="Klik untuk edit">
                <v-icon icon="mdi-food-apple-outline" size="14" color="orange-darken-3" class="mr-2"></v-icon>
                <span class="text-sm font-bold text-orange-900">{{ shift.start }} - {{ shift.end }}</span>
              </div>
            </template>

            <div v-if="crew.shifts.length === 0" class="text-sm font-medium text-slate-400 italic">
              Belum ada log aktivitas.
            </div>
          </div>
          
          <div class="md:w-auto text-right">
            <v-btn icon="mdi-plus-circle-outline" variant="text" color="slate-400" @click="openDialog(crew.id)"></v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Input/Edit Jam -->
    <v-dialog v-model="isDialogOpen" max-width="500" persistent>
      <v-card class="rounded-[1.5rem] shadow-2xl border border-slate-100">
        <v-card-title class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-50 rounded-lg">
              <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-clock-edit-outline'" color="indigo-darken-2" size="20"></v-icon>
            </div>
            <span class="text-lg font-black text-slate-800">{{ isEditing ? 'Edit Jam Aktivitas' : 'Catat Jam Aktivitas' }}</span>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" color="slate-400" @click="isDialogOpen = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="p-6 bg-slate-50">
          <v-form ref="form" @submit.prevent="saveLog">
            
            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Pilih Personel</label>
              <v-select v-model="formData.crewId" :items="rosterStore.users" item-title="name" item-value="ID" placeholder="Siapa yang bertugas?" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input" :rules="[v => !!v || 'Personel wajib dipilih']"></v-select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Lokasi Jaga (Hub)</label>
              <v-select v-model="formData.hubId" :items="hubStore.hubs" item-title="name" item-value="ID" placeholder="Pilih lokasi tugas" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input" :rules="[v => !!v || 'Lokasi wajib dipilih']"></v-select>
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
                <v-text-field v-model="formData.start" type="time" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input" :rules="[v => !!v || 'Wajib diisi']"></v-text-field>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Jam Selesai</label>
                <v-text-field v-model="formData.end" type="time" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input" :rules="[v => !!v || 'Wajib diisi']"></v-text-field>
              </div>
            </div>

            <div class="mb-2">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Keterangan (Opsional)</label>
              <v-text-field v-model="formData.notes" placeholder="Misal: Loading barang di Hub Utama" variant="outlined" bg-color="#ffffff" color="indigo-darken-2" density="comfortable" hide-details="auto" class="enterprise-input"></v-text-field>
            </div>

          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-4 border-t border-slate-100 bg-white">
          <!-- Tombol Hapus hanya muncul saat Edit Mode -->
          <v-btn v-if="isEditing" color="red-darken-2" variant="text" class="font-bold text-none px-2" @click="deleteLog" :disabled="isSaving">Hapus</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="slate-600" variant="text" class="font-bold text-none px-4" @click="isDialogOpen = false" :disabled="isSaving">Batal</v-btn>
          <v-btn color="indigo-darken-3" variant="flat" class="font-bold text-none px-6 rounded-lg shadow-md" @click="saveLog" :loading="isSaving">Simpan Log</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" :timeout="3000" class="mt-16">
      <div class="flex items-center gap-3 font-bold tracking-wide">
        <v-icon :icon="snackbar.icon" size="20"></v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRosterStore } from '../stores/roster'
import { useHubStore } from '../stores/hubs'

const rosterStore = useRosterStore()
const hubStore = useHubStore()

onMounted(async () => {
  await hubStore.fetchHubs() 
  await rosterStore.fetchUsers() 
  await rosterStore.fetchRosters() 
})

const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
const currentDate = new Date().toLocaleDateString('id-ID', dateOptions)

const formatTimeToRFC = (timeStr: string) => {
  const datePart = new Date().toLocaleDateString('en-CA') 
  return `${datePart}T${timeStr}:00+07:00`
}

const formatTimeFromRFC = (rfcString: string) => {
  if (!rfcString) return ''
  return new Date(rfcString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const targetHours = 1043
const totalLoggedHours = computed(() => {
  let totalMs = 0
  rosterStore.rosters.forEach(r => {
    if (!r.keterangan?.includes('[Istirahat]')) {
      const start = new Date(r.jam_mulai).getTime()
      const end = new Date(r.jam_selesai).getTime()
      if (end > start) totalMs += (end - start)
    }
  })
  return Math.floor(totalMs / (1000 * 60 * 60)) 
})
const progressPercentage = computed(() => ((totalLoggedHours.value / targetHours) * 100).toFixed(1))

const groupedRosterData = computed(() => {
  const grouped: Record<number, any> = {}
  const avatarColors = ['blue-darken-4', 'teal-darken-3', 'orange-darken-3', 'purple-darken-3', 'red-darken-3']
  
  rosterStore.users.forEach(u => {
    grouped[u.ID] = {
      id: u.ID,
      name: u.name,
      role: u.role === 'administrator' || u.role === 'admin' ? 'Koordinator' : 'Crew Lapangan',
      initials: u.name.substring(0, 2).toUpperCase(),
      avatarColor: avatarColors[u.ID % avatarColors.length],
      shifts: []
    }
  })

  rosterStore.rosters.forEach(r => {
    if(grouped[r.user_id]) {
      const type = r.keterangan?.includes('[Istirahat]') ? 'Istirahat' : 'Kerja'
      
      // Ambil notes aslinya tanpa tag [Kerja] atau [Istirahat]
      let pureNotes = r.keterangan || ''
      pureNotes = pureNotes.replace(/\[Kerja\]\s*/g, '').replace(/\[Istirahat\]\s*/g, '')

      grouped[r.user_id].shifts.push({
        id: r.ID, // Simpan ID Roster untuk Edit/Delete
        crewId: r.user_id,
        hubId: r.hub_id,
        type: type,
        start: formatTimeFromRFC(r.jam_mulai),
        end: formatTimeFromRFC(r.jam_selesai),
        hubName: r.hub?.name || 'Tidak diketahui',
        notes: pureNotes
      })
    }
  })

  Object.values(grouped).forEach(g => {
    g.shifts.sort((a: any, b: any) => a.start.localeCompare(b.start))
  })
  
  return Object.values(grouped)
})

// --- Logika Form Modal ---
const form = ref<any>(null)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const formData = ref<any>({ id: null, crewId: null, hubId: null, type: 'Kerja', start: '', end: '', notes: '' })

const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value = { show: true, text, color: type === 'success' ? 'green-darken-2' : 'red-darken-2', icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }
}

const openDialog = (prefillCrewId: any = null) => {
  isEditing.value = false
  formData.value = { id: null, crewId: prefillCrewId, hubId: null, type: 'Kerja', start: '', end: '', notes: '' }
  isDialogOpen.value = true
}

// TAMBAHAN: Buka modal mode Edit saat shift diklik
const editShift = (shift: any) => {
  isEditing.value = true
  formData.value = { 
    id: shift.id, 
    crewId: shift.crewId, 
    hubId: shift.hubId, 
    type: shift.type, 
    start: shift.start, 
    end: shift.end, 
    notes: shift.notes 
  }
  isDialogOpen.value = true
}

const saveLog = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  isSaving.value = true
  const keteranganString = `[${formData.value.type}] ${formData.value.notes}`
  const payload = {
    user_id: formData.value.crewId,
    hub_id: formData.value.hubId,
    jam_mulai: formatTimeToRFC(formData.value.start),
    jam_selesai: formatTimeToRFC(formData.value.end),
    keterangan: keteranganString
  }

  let result;
  if (isEditing.value) {
    result = await rosterStore.updateRoster(formData.value.id, payload)
  } else {
    result = await rosterStore.createRoster(payload)
  }
  
  isSaving.value = false

  if (result.success) {
    showNotif(isEditing.value ? 'Log aktivitas diperbarui' : 'Log aktivitas berhasil dicatat', 'success')
    isDialogOpen.value = false
  } else {
    showNotif(result.message, 'error')
  }
}

// TAMBAHAN: Fungsi Hapus Data
const deleteLog = async () => {
  if (confirm("Yakin ingin menghapus shift ini?")) {
    isSaving.value = true
    const result = await rosterStore.deleteRoster(formData.value.id)
    isSaving.value = false
    
    if (result.success) {
      showNotif('Shift berhasil dihapus', 'success')
      isDialogOpen.value = false
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
  border-color: #4f46e5 !important;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}
:deep(.v-field__outline) { display: none; }
</style>