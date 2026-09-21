import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/opengeometry/*.wasm',
          dest: '.'
        }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ['opengeometry']
  }
})
