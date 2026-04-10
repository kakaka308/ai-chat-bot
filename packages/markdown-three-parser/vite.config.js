// vite.config.js — 库模式构建配置
// 测试配置在 vitest.config.js，两者分开避免互相干扰
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'index.js'),
      name: 'MarkdownThreeParser',
      fileName: (format) => `markdown-three-parser.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 声明外部依赖，不打包进产物
      external: ['katex', 'prismjs'],
      output: {
        globals: {
          katex: 'katex',
          prismjs: 'Prism'
        }
      }
    }
  }
})