import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import router from './router/router.js'
import { createPinia } from 'pinia'

import { useAuthStore } from '@/stores/auth.stores.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()

await authStore.initializeAuth()

app.mount('#app')