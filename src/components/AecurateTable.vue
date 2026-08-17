<template>
  <v-card
    elevation="0"
    class="border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white"
  >
    <!-- Header Tabel -->
    <div
      class="p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h3 class="text-xl font-bold text-slate-800">{{ title }}</h3>
        <p class="text-sm text-slate-500 font-medium mt-1">{{ subtitle }}</p>
      </div>
      <div
        class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto"
      >
        <v-text-field
          v-model="searchValue"
          prepend-inner-icon="mdi-magnify"
          placeholder="Cari data..."
          variant="outlined"
          density="compact"
          bg-color="#f8fafc"
          color="blue-darken-2"
          hide-details
          class="w-full sm:w-[280px]"
        ></v-text-field>
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- Data Table Vuetify -->
    <v-data-table
      :headers="headers"
      :items="items"
      :search="searchValue"
      :items-per-page="10"
      hover
      class="aecurate-table"
    >
      <!-- Oper over slot dinamis agar halaman parent bisa custom kolom spesifik (seperti chip warna/tombol aksi) -->
      <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string;
  subtitle?: string; // Tanda tanya berarti opsional
  headers: any[];
  items: any[];
}>()

const searchValue = ref('')
</script>

<style scoped>
/* Styling tabel agar lebih rapi dan elegan */
:deep(.v-data-table-header__content) {
  font-weight: 700 !important;
  color: #64748b !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
:deep(td) {
  font-weight: 500;
  color: #334155;
  border-bottom: 1px solid #f1f5f9 !important;
}
</style>
