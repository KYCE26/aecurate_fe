<template>
  <div class="min-h-screen flex bg-[#f8fafc] font-sans selection:bg-blue-200">
    
    <!-- LEFT PANEL: Enterprise Branding (Tersembunyi di layar HP) -->
    <div class="hidden md:flex w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
      <!-- Ornamen Mesh Gradient Elegan -->
      <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>

      <div class="z-10 text-center px-16">
        <div class="flex justify-center mb-8">
          <div class="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            <v-icon icon="mdi-map-marker-path" size="64" color="white"></v-icon>
          </div>
        </div>
        <h1 class="text-5xl font-black text-white tracking-tight mb-4">AECURATE</h1>
        <p class="text-slate-300 text-lg font-medium tracking-wide leading-relaxed">
          Pusat Kendali Operasional Logistik<br/>ITB Ultra Marathon 2026
        </p>
      </div>
    </div>

    <!-- RIGHT PANEL: Area Form Login -->
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
      <div class="w-full max-w-md">
        
        <!-- Header Khusus Tampilan Mobile -->
        <div class="md:hidden text-center mb-10">
          <div class="flex justify-center mb-4">
            <div class="p-3 bg-blue-50 rounded-xl">
               <v-icon icon="mdi-map-marker-path" size="40" class="text-blue-700"></v-icon>
            </div>
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">AECURATE</h1>
          <p class="text-slate-500 text-sm mt-1 font-medium">Logistik ITB UM 2026</p>
        </div>

        <!-- Teks Sambutan Khusus Tampilan Desktop -->
        <div class="mb-10 hidden md:block">
          <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Selamat Datang</h2>
          <p class="text-slate-500 mt-2 text-sm font-medium">Autentikasi diperlukan untuk mengakses sistem.</p>
        </div>

        <!-- Form Container dengan Enterprise Shadow -->
        <div class="bg-white p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <v-form ref="form" v-model="isValid" @submit.prevent="handleLogin">
            
            <!-- Input Email -->
            <div class="mb-5">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Alamat Email</label>
              <v-text-field
                v-model="email"
                placeholder="nama@ecoethno.id"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                bg-color="#f8fafc"
                color="blue-darken-2"
                density="comfortable"
                :rules="[v => !!v || 'Email wajib diisi', v => /.+@.+\..+/.test(v) || 'Format email tidak valid']"
                hide-details="auto"
                class="enterprise-input"
              ></v-text-field>
            </div>

            <!-- Input Password -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-2 ml-1">
                 <label class="block text-sm font-bold text-slate-700">Password</label>
                 <a href="#" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Lupa sandi?</a>
              </div>
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                bg-color="#f8fafc"
                color="blue-darken-2"
                density="comfortable"
                :rules="[v => !!v || 'Password wajib diisi']"
                hide-details="auto"
                class="enterprise-input"
              ></v-text-field>
            </div>

            <!-- Simulasi Pilih Role (Untuk Testing) -->
            <div class="mb-8">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Akses Sebagai</label>
              <v-select
                v-model="selectedRole"
                :items="roles"
                item-title="title"
                item-value="value"
                prepend-inner-icon="mdi-shield-account-outline"
                variant="outlined"
                bg-color="#f8fafc"
                color="blue-darken-2"
                density="comfortable"
                hide-details
                class="enterprise-input"
              ></v-select>
            </div>

            <!-- Tombol Login Enterprise (FIXED) -->
            <v-btn 
              type="submit" 
              size="x-large" 
              block 
              variant="flat"
              :loading="isLoading"
              class="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 transition-all duration-300"
              style="border-radius: 12px; height: 54px;"
            >
              <span class="font-bold tracking-widest text-sm uppercase">Masuk Ke Sistem</span>
            </v-btn>
          </v-form>
        </div>
        
        <!-- Footer Tambahan -->
        <p class="text-center text-xs text-slate-400 mt-8 font-medium">
          &copy; 2026 Divisi Logistik ITB Ultra Marathon.<br class="md:hidden"/> All rights reserved.
        </p>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref(null)
const isValid = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)

const email = ref('')
const password = ref('')
const selectedRole = ref('admin')

const roles = [
  { title: 'Administrator (Koordinator)', value: 'admin' },
  { title: 'Crew Lapangan', value: 'crew' }
]

const handleLogin = async () => {
  if (!isValid.value) return

  isLoading.value = true
  setTimeout(async () => {
    await authStore.login(email.value, selectedRole.value)
    isLoading.value = false
    router.push('/')
  }, 1200)
}
</script>

<style scoped>
/* Styling khusus untuk menghaluskan komponen input Vuetify */
:deep(.v-field) {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
:deep(.v-field:hover) {
  border-color: #cbd5e1;
  background-color: #ffffff !important;
}
:deep(.v-field--focused) {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  background-color: #ffffff !important;
}
:deep(.v-field__outline) {
  display: none; /* Menyembunyikan outline bawaan Vuetify agar bisa di-override oleh CSS di atas */
}
</style>