import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 创建应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 先使用 Pinia，再挂载应用
app.use(pinia)
app.mount('#app')
