import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/app.sass'

createApp(App).use(router).mount('#app')
