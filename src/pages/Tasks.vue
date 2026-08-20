<template>
  <div class="p-4 md:p-8 max-w-[1400px] mx-auto h-screen flex flex-col pb-20 md:pb-8">
    <!-- Header Command Center -->
    <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 p-4 md:p-6 rounded-[1.5rem] shadow-xl">
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <v-icon icon="mdi-monitor-dashboard" color="blue-400"></v-icon>
          Live Task Board
        </h1>
        <p class="text-slate-400 font-medium text-sm mt-1">Monitor permintaan barang dan pergerakan kru secara real-time.</p>
      </div>
      <div class="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
        <div class="w-3 h-3 rounded-full animate-pulse" :class="taskStore.isConnected ? 'bg-green-500' : 'bg-red-500'"></div>
        <span class="font-bold text-sm tracking-wider" :class="taskStore.isConnected ? 'text-green-400' : 'text-red-400'">
          {{ taskStore.isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED' }}
        </span>
      </div>
    </div>

    <!-- Papan Kanban 3 Kolom -->
    <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
      
      <!-- KOLOM 1: Antrian Baru (Menunggu) -->
      <div class="flex flex-col bg-slate-100 rounded-[1.5rem] p-4 border border-slate-200">
        <div class="flex justify-between items-center mb-4 px-2">
          <h2 class="font-black text-slate-700 uppercase tracking-wider">Antrian Baru</h2>
          <v-chip color="blue-darken-3" class="font-bold">{{ taskStore.newTasks.length }}</v-chip>
        </div>
        <div class="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
          <v-slide-y-transition group>
            <div 
              v-for="task in taskStore.newTasks" :key="task.ID" 
              class="bg-white p-5 rounded-2xl shadow-sm border-l-8 transition-all duration-300 relative overflow-hidden"
              :class="{
                'border-l-blue-500': !task.escalationLevel,
                'border-l-orange-500 bg-orange-50': task.escalationLevel === 1,
                'border-l-red-600 bg-red-100 animate-pulse border-red-300 shadow-red-200 shadow-lg': task.escalationLevel >= 2
              }"
            >
              <div v-if="task.escalationLevel >= 2" class="absolute top-2 right-2 flex items-center gap-1 text-red-600">
                <v-icon icon="mdi-alert" size="16"></v-icon>
                <span class="text-[10px] font-black uppercase">Eskalasi!</span>
              </div>

              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold text-slate-400">{{ formatTime(task.CreatedAt) }} • TSK-{{ task.ID }}</span>
              </div>
              <h3 class="text-lg font-black text-slate-800 leading-tight mb-1">{{ task.qty }}x {{ task.item_name }}</h3>
              <p class="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                <v-icon icon="mdi-map-marker-outline" size="16"></v-icon> {{ task.location }}
              </p>
              
              <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="text-xs font-bold text-slate-500">Req: {{ task.requested_by }}</span>
                <v-btn color="blue-darken-3" variant="flat" size="small" class="font-bold rounded-lg" @click="taskStore.takeTask(task.ID)">
                  Saya Kerjakan
                </v-btn>
              </div>
            </div>
          </v-slide-y-transition>
        </div>
      </div>

      <!-- KOLOM 2: Sedang Diproses -->
      <div class="flex flex-col bg-slate-100 rounded-[1.5rem] p-4 border border-slate-200">
        <div class="flex justify-between items-center mb-4 px-2">
          <h2 class="font-black text-slate-700 uppercase tracking-wider">Sedang Diproses</h2>
          <v-chip color="orange-darken-3" class="font-bold">{{ taskStore.inProgressTasks.length }}</v-chip>
        </div>
        <div class="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
          <v-slide-x-transition group>
            <div v-for="task in taskStore.inProgressTasks" :key="task.ID" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 class="text-md font-black text-slate-800 leading-tight mb-1">{{ task.qty }}x {{ task.item_name }}</h3>
              <p class="text-xs font-bold text-slate-500 mb-3">Tujuan: {{ task.location }}</p>
              
              <div class="flex items-center justify-between bg-blue-50 p-2 rounded-lg mb-3">
                <div class="flex items-center gap-2">
                  <v-avatar color="blue-darken-2" size="24"><span class="text-[10px] text-white">{{ task.assignee_name?.charAt(0) || '?' }}</span></v-avatar>
                  <span class="text-xs font-bold text-blue-900">{{ task.assignee_name || 'Crew' }}</span>
                </div>
              </div>

              <v-btn block color="green-darken-2" variant="tonal" size="small" class="font-bold rounded-lg" @click="taskStore.resolveTask(task.ID)">
                Tandai Selesai
              </v-btn>
            </div>
          </v-slide-x-transition>
        </div>
      </div>

      <!-- KOLOM 3: Selesai -->
      <div class="flex flex-col bg-slate-100 rounded-[1.5rem] p-4 border border-slate-200 opacity-75">
        <div class="flex justify-between items-center mb-4 px-2">
          <h2 class="font-black text-slate-700 uppercase tracking-wider">Selesai</h2>
          <v-chip color="green-darken-2" class="font-bold">{{ taskStore.completedTasks.length }}</v-chip>
        </div>
        <div class="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
          <v-slide-x-reverse-transition group>
            <div v-for="task in taskStore.completedTasks" :key="task.ID" class="bg-white p-4 rounded-xl border border-slate-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-bold text-slate-700 strike-through">{{ task.item_name }} ({{ task.qty }})</h3>
                  <p class="text-[10px] text-slate-500">Diselesaikan oleh: {{ task.assignee_name }}</p>
                </div>
                <v-icon icon="mdi-check-circle" color="green-darken-2"></v-icon>
              </div>
            </div>
          </v-slide-x-reverse-transition>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTaskStore } from '../stores/tasks'

const taskStore = useTaskStore()

onMounted(async () => {
  // Tarik data tugas yang sudah ada di database saat buka halaman
  await taskStore.fetchInitialTasks()

  // Nyalakan koneksi WebSocket
  if (!taskStore.isConnected) {
    taskStore.connectToWS()
  }
})

// Helper untuk format waktu (YYYY-MM-DDTHH:mm:ssZ -> HH:mm)
const formatTime = (isoString: string) => {
  if (!isoString) return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.v-enter-active, .v-leave-active { transition: all 0.4s ease; }
.v-enter-from, .v-leave-to { opacity: 0; transform: translateY(20px); }
.strike-through { text-decoration: line-through; }
</style>