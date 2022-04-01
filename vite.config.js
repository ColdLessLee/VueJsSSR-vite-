import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: import.meta.env == 'product' ? '/' : './'
})
// const vuePlugin = require('@vitejs/plugin-vue')
// module.exports = {
//   plugins: [
//     vuePlugin()
//   ],
//   build: {
//     minify: false
//   },
//   base:import.meta.env=='product'? '/':
// }
