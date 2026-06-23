import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname)
  const env = loadEnv(mode, envDir, 'VITE_')
  /** Local Node API during `vite` dev; production builds do not use this proxy. */
  const devBackendTarget =
    env.VITE_DEV_PROXY_TARGET?.trim() || 'http://127.0.0.1:3000'
  const devAdminBackendTarget =
    env.VITE_DEV_ADMIN_PROXY_TARGET?.trim() || 'http://127.0.0.1:3001'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
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
      proxy: {
        // Admin API → port 3001 (must be registered before the catch-all /api rule)
        '/api/admin': {
          target: devAdminBackendTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
        '/api': {
          target: devBackendTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
        '/socket.io': {
          target: devBackendTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})