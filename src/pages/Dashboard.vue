<template>
  <div class="p-6 md:p-10 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">Ringkasan Operasional</h1>
      <p class="text-slate-500 font-medium mt-1">
        Pantauan real-time ketersediaan barang dan personel.
      </p>
    </div>

    <!-- Statistik Utama -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Card Tugas Pending -->
      <v-card
        elevation="0"
        class="p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow cursor-pointer"
      >
        <div class="flex justify-between items-start">
          <div>
            <p
              class="text-sm text-slate-500 font-bold tracking-wide uppercase mb-2"
            >
              Tugas Pending
            </p>
            <h3 class="text-4xl font-black text-slate-800">4</h3>
          </div>
          <div class="p-3 bg-red-50 rounded-2xl text-red-500">
            <v-icon icon="mdi-clipboard-text-clock" size="32"></v-icon>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm text-slate-500">
          <v-icon
            icon="mdi-alert-circle-outline"
            size="16"
            class="mr-1 text-red-400"
          ></v-icon>
          <span>2 butuh eskalasi</span>
        </div>
      </v-card>

      <!-- Card Crew Aktif -->
      <v-card
        elevation="0"
        class="p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow cursor-pointer"
      >
        <div class="flex justify-between items-start">
          <div>
            <p
              class="text-sm text-slate-500 font-bold tracking-wide uppercase mb-2"
            >
              Crew Tersedia
            </p>
            <h3 class="text-4xl font-black text-slate-800">
              12<span class="text-xl text-slate-400 font-medium">/19</span>
            </h3>
          </div>
          <div class="p-3 bg-green-50 rounded-2xl text-green-500">
            <v-icon icon="mdi-account-group" size="32"></v-icon>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm text-slate-500">
          <v-icon
            icon="mdi-check-circle-outline"
            size="16"
            class="mr-1 text-green-500"
          ></v-icon>
          <span>Shift pagi berjalan normal</span>
        </div>
      </v-card>

      <!-- Card Peringatan Stok -->
      <v-card
        elevation="0"
        class="p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow cursor-pointer"
      >
        <div class="flex justify-between items-start">
          <div>
            <p
              class="text-sm text-slate-500 font-bold tracking-wide uppercase mb-2"
            >
              Peringatan Stok
            </p>
            <h3 class="text-4xl font-black text-slate-800">2</h3>
          </div>
          <div class="p-3 bg-orange-50 rounded-2xl text-orange-500">
            <v-icon icon="mdi-package-variant-closed" size="32"></v-icon>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm text-slate-500">
          <v-icon
            icon="mdi-trending-down"
            size="16"
            class="mr-1 text-orange-400"
          ></v-icon>
          <span>Trash bag (Kritis) di Hub Utama</span>
        </div>
      </v-card>
    </div>
  </div>
</template>
