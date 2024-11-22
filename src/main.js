import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useEditorStore } from './stores/editor'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 创建应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 先使用 Pinia，再挂载应用
app.use(pinia)

// 创建 store 实例
const store = useEditorStore()
// 加载自动保存数据
store.loadAutoSave()

app.use(ElementPlus)

app.mount('#app')