import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 프론트엔드에서 /api로 시작하는 모든 요청을 가로챕니다.
      '/api': {
        target: 'http://49.247.30.225:4103',
        changeOrigin: true,
        // rewrite를 제거하여 /api 경로를 그대로 유지한 채 target 뒤에 붙입니다.
        // 결과적으로 http://49.247.30.225:4103/api/... 가 됩니다.
      },
    },
  },
})
