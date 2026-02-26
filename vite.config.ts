import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // 核心大招：把所有前端带 /api 的请求，全部偷偷转给后端的 5000 端口！
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})