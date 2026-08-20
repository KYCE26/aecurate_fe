<template>
  <div class="min-h-screen flex bg-[#f8fafc] font-sans selection:bg-blue-200">
    
    <!-- LEFT PANEL: Enterprise Branding -->
    <div class="hidden md:flex w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
      <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse-slow"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>

      <div class="z-10 text-center px-16">
        <div class="flex justify-center mb-8">
          <div class="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <v-icon icon="mdi-account-plus-outline" size="64" color="white"></v-icon>
          </div>
        </div>
        <h1 class="text-5xl font-black text-white tracking-tight mb-4">BERGABUNG</h1>
        <p class="text-slate-300 text-lg font-medium tracking-wide leading-relaxed">
          Daftarkan diri Anda sebagai Crew Lapangan<br/>ITB Ultra Marathon 2026
        </p>
      </div>
    </div>

    <!-- RIGHT PANEL: Area Form Register -->
    <div class="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
      <div class="w-full max-w-md">
        
        <div class="md:hidden text-center mb-10">
          <div class="flex justify-center mb-4">
            <div class="p-3 bg-blue-50 rounded-xl shadow-sm border border-blue-100">
               <v-icon icon="mdi-account-plus-outline" size="40" class="text-blue-700"></v-icon>
            </div>
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">BUAT AKUN</h1>
        </div>

        <div class="mb-10 hidden md:block">
          <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Buat Akun Baru</h2>
          <p class="text-slate-500 mt-2 text-sm font-medium">Lengkapi data diri untuk bergabung ke dalam sistem.</p>
        </div>

        <div class="bg-white p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
          
          <!-- Alert Pesan Error / Success -->
          <v-expand-transition>
            <div v-if="alertMessage" class="mb-6 flex items-start gap-3 p-4 border rounded-xl" :class="isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
              <v-icon :icon="isSuccess ? 'mdi-check-circle' : 'mdi-alert-octagon'" :color="isSuccess ? 'green-darken-2' : 'red-darken-2'" size="24"></v-icon>
              <div>
                <h4 class="text-sm font-bold" :class="isSuccess ? 'text-green-800' : 'text-red-800'">{{ isSuccess ? 'Berhasil' : 'Gagal' }}</h4>
                <p class="text-xs font-semibold mt-0.5 leading-tight" :class="isSuccess ? 'text-green-600' : 'text-red-600'">{{ alertMessage }}</p>
              </div>
            </div>
          </v-expand-transition>

          <v-form ref="form" v-model="isValid" @submit.prevent="handleRegister">
            
            <div class="mb-5">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Nama Lengkap</label>
              <v-text-field
                v-model="name"
                placeholder="Misal: Budi Santoso"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined" bg-color="#f8fafc" color="blue-darken-3" density="comfortable"
                :rules="[v => !!v || 'Nama wajib diisi']"
                hide-details="auto" class="enterprise-input" :disabled="isLoading || isSuccess"
              ></v-text-field>
            </div>

            <div class="mb-5">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Alamat Email</label>
              <v-text-field
                v-model="email"
                placeholder="nama@email.com"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined" bg-color="#f8fafc" color="blue-darken-3" density="comfortable"
                :rules="[v => !!v || 'Email wajib diisi', v => /.+@.+\..+/.test(v) || 'Format email tidak valid']"
                hide-details="auto" class="enterprise-input" :disabled="isLoading || isSuccess"
              ></v-text-field>
            </div>

            <div class="mb-8">
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Kata Sandi (Min. 6 Karakter)</label>
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined" bg-color="#f8fafc" color="blue-darken-3" density="comfortable"
                :rules="[v => !!v || 'Password wajib diisi', v => v.length >= 6 || 'Minimal 6 karakter']"
                hide-details="auto" class="enterprise-input" :disabled="isLoading || isSuccess"
              ></v-text-field>
            </div>

            <v-btn 
              type="submit" size="x-large" block variant="flat" :loading="isLoading" :disabled="isSuccess"
              class="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 transition-all duration-300 mb-4"
              style="border-radius: 12px; height: 54px;"
            >
              <span class="font-bold tracking-widest text-sm uppercase">DAFTAR SEKARANG</span>
            </v-btn>
            
            <p class="text-center text-sm font-medium text-slate-500">
              Sudah punya akun? 
              <router-link to="/login" class="text-blue-600 font-bold hover:underline">Masuk di sini</router-link>
            </p>
          </v-form>
        </div>
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
const alertMessage = ref('')
const isSuccess = ref(false)

const name = ref('')
const email = ref('')
const password = ref('')

const handleRegister = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  isLoading.value = true
  alertMessage.value = ''
  isSuccess.value = false

  const result = await authStore.register(name.value, email.value, password.value)
  isLoading.value = false

  if (result.success) {
    isSuccess.value = true
    alertMessage.value = "Pendaftaran berhasil! Mengalihkan ke halaman login..."
    // Tunggu 2 detik biarkan user baca pesan sukses, lalu lempar ke halaman login
    setTimeout(() => { router.push('/login') }, 2000)
  } else {
    isSuccess.value = false
    alertMessage.value = result.message
  }
}
</script>

<style scoped>
:deep(.v-field) {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
:deep(.v-field:hover) { border-color: #cbd5e1; background-color: #ffffff !important; }
:deep(.v-field--focused) { border-color: #1e3a8a !important; box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.1); background-color: #ffffff !important; }
:deep(.v-field__outline) { display: none; }
.animate-pulse-slow { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.35; } }
</style>