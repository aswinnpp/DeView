import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@shared': path.resolve(__dirname, '../Shared'),
    },
  },

server: {
  host: true,
  port: 5174,
  strictPort: true,
  allowedHosts: true,
  fs: {
    allow: [path.resolve(__dirname, '..')],
  },
}
})