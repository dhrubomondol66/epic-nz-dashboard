import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.PORT) || 3000,
      allowedHosts: true,
      proxy: {
        '/api/v1/': {
          target: env.VITE_API_TARGET || 'https://epicnz.app/',
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
    },
    preview: {
      host: '0.0.0.0',
      port: Number(env.PORT) || 4173,
      allowedHosts: true
    }
  };
});
