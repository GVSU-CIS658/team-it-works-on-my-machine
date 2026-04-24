  import { defineConfig } from 'vite'
  import vue from '@vitejs/plugin-vue'
  import vuetify from 'vite-plugin-vuetify'

  export default defineConfig({
    base: '/team-it-works-on-my-machine/',
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
    ],
    server: {
      port: 4800,
    },
  })
