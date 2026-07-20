import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initDemoData } from './utils/api'
import './style.css'

initDemoData()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
