import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ★ 1. Piniaをインポートする
import { createPinia } from 'pinia'

const app = createApp(App)

// ★ 2. Piniaのインスタンスを作成する
const pinia = createPinia()

// ★ 3. VueアプリにPiniaとRouterを登録する
app.use(pinia)
app.use(router)

app.mount('#app')