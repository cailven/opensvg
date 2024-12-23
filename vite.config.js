import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/opensvg/',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/upload': {  // 这里的路径要匹配你的上传接口
        target: 'https://svgtools.im20.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload/, '/User/doUploadWx')
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
