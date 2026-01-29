import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(/%VITE_KAKAO_MAP_KEY%/g, env.VITE_KAKAO_MAP_KEY || '');
        },
      },
    ],
    server: {
      port: 1204,
      proxy: {
        '/api': {
          target: 'http://49.247.30.225:4103',
          changeOrigin: true,
        },
      },
    },
  }
})
