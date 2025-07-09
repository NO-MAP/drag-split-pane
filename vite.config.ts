import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dts from 'vite-plugin-dts'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
    }),
    tailwindcss()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'DragSplitPane',
      // 将添加适当的扩展名后缀
      fileName: 'drag-split-pane',
      formats: ['es'],
    },
    rollupOptions: {
      // 确保外部化处理那些
      // 你不想打包进库的依赖
      external: ['vue', 'uuid', '@vueuse/core'],
    },
  },
})
