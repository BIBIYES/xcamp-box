import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({}),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080', //目标请求的地址
        // 解决跨域问题
        changeOrigin: true,
        ws: true, // 启用WebSocket代理
        rewrite: (path) => {
          console.log('🚀 ~ path:', path)
          return path.replace(/^\/api/, '') //是否替换掉地址栏的/api
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // '@' 指向 src 目录
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)), // 组件目录别名
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)), // 静态资源别名
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)), // Pinia 状态管理别名
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'], // 导入时可省略的扩展名
  },
})
