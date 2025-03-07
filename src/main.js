import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'animate.css'
import App from './App.vue'
import router from './router'
import { install } from '@icon-park/vue-next/es/all'
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
install(app)
app.use(pinia)

app.use(router)
app.mount('#app')
