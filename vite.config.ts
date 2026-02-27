/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api/v1/': {
target: import.meta.env.VITE_API_TARGET || 'http://localhost:5000', // Default to ngrok if env var is not found
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 60000, // 60 seconds timeout for requests
        proxyTimeout: 60000, // 60 seconds timeout for proxy communication
        headers: {
          'Connection': 'keep-alive',
          'ngrok-skip-browser-warning': 'true',
          'Keep-Alive': 'timeout=60, max=100'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            if (err.message.includes('socket hang up') || err.message.includes('ECONNRESET')) {
              // Ignore frequent polling reset errors
              return;
            }
            console.warn('Vite Proxy Warning:', err.message);
          });
        }
      }
    }
  }
})