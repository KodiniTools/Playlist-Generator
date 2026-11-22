import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { registerServiceWorker } from './utils/pwa'
import { enforceFavicon, SITE_ROOT } from './utils/favicon'
import { IS_DESKTOP } from './utils/desktop'

// Nur das Site-Favicon kodinitools.com/favicon.ico (wie alle KodiniTools-Apps),
// nie ein anderes Icon aus SSI-Partials o. Ä.
enforceFavicon(SITE_ROOT)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// Offline-Nutzung und Installation als App (PWA); die Desktop-App ist ohnehin offline
if (import.meta.env.PROD && !IS_DESKTOP) registerServiceWorker(import.meta.env.BASE_URL)
