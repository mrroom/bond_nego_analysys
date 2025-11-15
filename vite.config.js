import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8002,  // 원하는 포트 번호로 변경
    strictPort: true,  // 포트가 이미 사용 중이면 다른 포트로 변경하지 않고 에러 발생
    host: true,  // 네트워크에서 접근 가능하도록 (0.0.0.0)
  }
})
