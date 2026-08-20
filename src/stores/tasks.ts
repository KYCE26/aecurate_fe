import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../plugins/axios'
import { useAuthStore } from './auth'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<any[]>([])
  const isConnected = ref(false)
  let ws: WebSocket | null = null
  let reconnectInterval: any = null

  const authStore = useAuthStore()

  const newTasks = computed(() => tasks.value.filter(t => t.status === 'Menunggu'))
  const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'Diproses'))
  const completedTasks = computed(() => tasks.value.filter(t => t.status === 'Selesai'))

  // 1. Tarik Data Awal
  const fetchInitialTasks = async () => {
    try {
      const response = await api.get('/tasks') 
      if (response.data.tasks) {
        tasks.value = response.data.tasks
      }
    } catch (error) {
      console.error("Gagal menarik data antrian tugas awal:", error)
    }
  }

  // 2. Koneksi WebSocket
  const connectToWS = () => {
    const wsUrl = import.meta.env.VITE_WS_URL + '/tasks'
    ws = new WebSocket(wsUrl)
    
    ws.onopen = () => { 
      isConnected.value = true
      clearInterval(reconnectInterval)
      reconnectInterval = null
    }
    
    ws.onmessage = (event) => { 
      try {
        const payload = JSON.parse(event.data)
        handleIncomingMessage(payload) 
      } catch (e) {
        console.error("Gagal parsing data WebSocket", e)
      }
    }
    
    ws.onclose = () => { 
      isConnected.value = false
      attemptReconnect() 
    }
  }

  const attemptReconnect = () => {
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => {
        connectToWS()
      }, 5000)
    }
  }

  // 3. Handle Pesan Masuk (DISESUAIKAN DENGAN GOLANG: TASK_UPDATED)
  const handleIncomingMessage = (payload: any) => {
    if (payload.action === 'NEW_TASK') {
      const exists = tasks.value.find(t => t.ID === payload.data.ID)
      if (!exists) {
        tasks.value.unshift(payload.data)
        playNotificationSound()
      }
    } 
    else if (payload.action === 'TASK_UPDATED' || payload.action === 'UPDATE_TASK') {
      const taskIndex = tasks.value.findIndex(t => t.ID === payload.data.ID)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = payload.data
      } else {
        tasks.value.unshift(payload.data)
      }
    }
    else if (payload.action === 'ESCALATION') {
      const taskIndex = tasks.value.findIndex(t => t.ID === payload.taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex].escalationLevel = payload.level
        if (payload.level >= 2) playEscalationSound()
      }
    }
  }

  // 4. AKSI CREW MENGGUNAKAN AXIOS PATCH (Menyesuaikan Handler Golang)
  const takeTask = async (taskId: number) => {
    try {
      const assigneeName = authStore.user?.name || 'Crew Lapangan'
      
      // Tembak endpoint PATCH /api/tasks/:id/take buatan temen lu
      const response = await api.patch(`/tasks/${taskId}/take`, {
        assignee_name: assigneeName
      })

      // Update data lokal dari hasil response server
      const updatedTask = response.data.task
      const taskIndex = tasks.value.findIndex(t => t.ID === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = updatedTask
      }
    } catch (error: any) {
      console.error("Gagal mengambil tugas:", error.response?.data?.error || error.message)
    }
  }

  const resolveTask = async (taskId: number) => {
    try {
      // Tembak endpoint PATCH /api/tasks/:id/resolve buatan temen lu
      const response = await api.patch(`/tasks/${taskId}/resolve`)

      // Update data lokal dari hasil response server
      const updatedTask = response.data.task
      const taskIndex = tasks.value.findIndex(t => t.ID === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = updatedTask
      }
    } catch (error: any) {
      console.error("Gagal menyelesaikan tugas:", error.response?.data?.error || error.message)
    }
  }

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    audio.play().catch(() => {}) 
  }

  const playEscalationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3')
    audio.play().catch(() => {})
  }

  return { 
    tasks, isConnected, newTasks, inProgressTasks, completedTasks, 
    fetchInitialTasks, connectToWS, takeTask, resolveTask 
  }
})