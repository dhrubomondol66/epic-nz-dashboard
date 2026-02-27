/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
console.log('VITE_API_TARGET:', process.env.VITE_API_TARGET); // Check if the variable is defined

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/v1/': {
        target: process.env.VITE_API_TARGET || 'http://142.248.180.28:5000/',
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 60000,
        proxyTimeout: 60000,
        headers: {
          'Connection': 'keep-alive',
          'ngrok-skip-browser-warning': 'true',
          'Keep-Alive': 'timeout=60, max=100'
        }
      }
    }
  }
});