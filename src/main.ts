import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { registerServiceWorker } from './utils/pwa'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// Offline-Nutzung und Installation als App (PWA)
if (import.meta.env.PROD) registerServiceWorker(import.meta.env.BASE_URL)
