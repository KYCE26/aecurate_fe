<template>
  <div class="min-h-screen flex bg-[#f8fafc] font-sans selection:bg-blue-200">
    
    <!-- LEFT PANEL: Enterprise Branding (Tersembunyi di layar HP) -->
    <div class="hidden md:flex w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
      <!-- Ornamen Mesh Gradient Elegan -->
      <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse-slow"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>

      <div class="z-10 text-center px-16">
        <div class="flex justify-center mb-8">
          <div class="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transform hover:scale-105 transition-transform duration-500">
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
            <div class="p-3 bg-blue-50 rounded-xl shadow-sm border border-blue-100">
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
        <div class="bg-white p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
          
          <!-- Alert Pesan Error dari Backend -->
          <v-expand-transition>
            <div v-if="errorMessage" class="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <v-icon icon="mdi-alert-octagon" color="red-darken-2" size="24"></v-icon>
              <div>
                <h4 class="text-sm font-bold text-red-800">Akses Ditolak</h4>
                <p class="text-xs font-semibold text-red-600 mt-0.5 leading-tight">{{ errorMessage }}</p>
              </div>
            </div>
          </v-expand-transition>

          <v-form ref="form" v-model="isValid" @submit.prevent="handleLogin">
            
            <!-- Input Email -->
            <div class="mb-5">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Alamat Email</label>
              <v-text-field
                v-model="email"
                placeholder="nama@email.com"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                bg-color="#f8fafc"
                color="blue-darken-3"
                density="comfortable"
                :rules="[v => !!v || 'Email wajib diisi', v => /.+@.+\..+/.test(v) || 'Format email tidak valid']"
                hide-details="auto"
                class="enterprise-input"
                :disabled="isLoading"
              ></v-text-field>
            </div>

            <!-- Input Password -->
            <div class="mb-8">
              <div class="flex justify-between items-center mb-2 ml-1">
                 <label class="block text-sm font-bold text-slate-700">Kata Sandi</label>
                 <a href="#" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Lupa sandi?</a>
              </div>
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                bg-color="#f8fafc"
                color="blue-darken-3"
                density="comfortable"
                :rules="[v => !!v || 'Password wajib diisi']"
                hide-details="auto"
                class="enterprise-input"
                :disabled="isLoading"
              ></v-text-field>
            </div>

            <!-- Tombol Login Enterprise -->
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
            <p class="text-center text-sm font-medium text-slate-500 mt-5">
              Belum punya akun? 
              <router-link to="/register" class="text-blue-600 font-bold hover:underline">Daftar sekarang</router-link>
            </p>
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

const form = ref<any>(null)
const isValid = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  // 1. Validasi form UI
  const { valid } = await form.value.validate()
  if (!valid) return

  // 2. Set state loading & bersihkan error sebelumnya
  isLoading.value = true
  errorMessage.value = ''

  // 3. Tembak API Asli via Pinia Store
  const result = await authStore.login(email.value, password.value)

  // 4. Matikan loading
  isLoading.value = false

  // 5. Evaluasi hasil
  if (result.success) {
    router.push('/') // Redirect ke Dashboard kalau sukses
  } else {
    errorMessage.value = result.message // Tampilkan pesan merah dari Golang kalau gagal
  }
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
  border-color: #1e3a8a !important; /* Biru tua elegan */
  box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.1);
  background-color: #ffffff !important;
}
:deep(.v-field__outline) {
  display: none; 
}

/* Animasi tambahan biar gak kaku */
.animate-pulse-slow {
  animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.35; }
}
</style>