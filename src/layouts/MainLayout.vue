<template>
  <v-app class="bg-slate-50">
    <!-- SIDEBAR -->
    <v-navigation-drawer v-model="drawer" color="slate-900" theme="dark" border="0" elevation="10">
      <div class="px-6 py-8 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-600 rounded-lg">
            <v-icon icon="mdi-map-marker-path" color="white" size="24"></v-icon>
          </div>
          <div>
            <h2 class="text-xl font-black tracking-widest text-white leading-none">AECURATE</h2>
            <p class="text-[10px] text-blue-300 font-bold tracking-widest mt-1 uppercase">Logistik UM 2026</p>
          </div>
        </div>
      </div>

      <div class="px-3 py-4">
        <p class="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Utama</p>
        <v-list nav class="p-0">
          <v-list-item 
            to="/" 
            exact 
            prepend-icon="mdi-view-dashboard-outline" 
            title="Dashboard" 
            class="mb-1 rounded-xl hover:bg-white/5"
            active-class="bg-blue-600 text-white"
          ></v-list-item>
          <v-list-item 
            to="/tasks" 
            prepend-icon="mdi-clipboard-text-clock-outline" 
            title="Antrian Tugas" 
            class="mb-1 rounded-xl hover:bg-white/5"
            active-class="bg-blue-600 text-white"
          ></v-list-item>
          
          <template v-if="authStore.user?.role === 'admin'">
            <div class="mt-6 mb-2 px-3 flex items-center gap-2">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Master Data</p>
              <v-divider class="border-slate-700"></v-divider>
            </div>
            
            <!-- FIX: Tambahkan property to="/inventory" dan active-class -->
            <v-list-item 
              to="/inventory" 
              prepend-icon="mdi-package-variant-closed" 
              title="Katalog Barang" 
              class="mb-1 rounded-xl hover:bg-white/5"
              active-class="bg-blue-600 text-white"
            ></v-list-item>
            
            <!-- FIX: Tambahkan property to="/hubs" dan active-class -->
            <v-list-item 
              to="/hubs" 
              prepend-icon="mdi-map-marker-radius-outline" 
              title="Lokasi Hub" 
              class="mb-1 rounded-xl hover:bg-white/5"
              active-class="bg-blue-600 text-white"
            ></v-list-item>

            <v-list-item 
              to="/roster" 
              prepend-icon="mdi-account-clock-outline" 
              title="Roster & Shift" 
              class="mb-1 rounded-xl hover:bg-white/5"
              active-class="bg-blue-600 text-white"
            ></v-list-item>
          </template>
        </v-list>
      </div>
      
      <template v-slot:append>
        <div class="p-4 border-t border-white/10">
          <v-btn 
            block 
            variant="tonal" 
            color="red-lighten-1" 
            prepend-icon="mdi-logout"
            class="rounded-xl font-bold tracking-wide"
            @click="handleLogout"
          >
            Keluar
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- HEADER -->
    <v-app-bar elevation="0" class="border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="slate-700"></v-app-bar-nav-icon>
      
      <v-breadcrumbs :items="['Pusat Kendali', 'Dashboard']" class="text-sm font-semibold text-slate-600 hidden sm:flex">
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right" size="16"></v-icon>
        </template>
      </v-breadcrumbs>
      
      <v-spacer></v-spacer>

      <!-- Toggle Status -->
      <div class="hidden md:flex items-center gap-3 mr-6 bg-slate-100 py-1.5 px-4 rounded-full border border-slate-200">
        <div class="w-2 h-2 rounded-full" :class="isAvailable ? 'bg-green-500' : 'bg-red-500'"></div>
        <span class="text-xs font-bold tracking-wide" :class="isAvailable ? 'text-green-700' : 'text-red-600'">
          {{ isAvailable ? 'TERSEDIA' : 'SIBUK' }}
        </span>
        <v-switch 
          v-model="isAvailable" 
          color="success" 
          hide-details 
          density="compact" 
          inset
          class="ml-2 scale-90"
        ></v-switch>
      </div>

      <!-- User Profile -->
      <div class="mr-4 flex items-center gap-3 pl-4 border-l border-slate-200">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-bold text-slate-800 leading-none capitalize">{{ authStore.user?.name || 'User' }}</p>
          <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{{ authStore.user?.role || 'Role' }}</p>
        </div>
        <v-avatar color="blue-lighten-4" size="42" class="cursor-pointer border-2 border-white shadow-sm">
          <span class="text-blue-700 text-sm font-bold">{{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}</span>
        </v-avatar>
      </div>
    </v-app-bar>

    <!-- MAIN CONTENT -->
    <v-main class="bg-slate-50 min-h-screen">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const drawer = ref(true)
const isAvailable = ref(true)
const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
:deep(.v-navigation-drawer) {
  border-right: none !important;
}
:deep(.v-list-item--active) {
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
</style>