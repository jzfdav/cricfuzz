import { defineConfig } from 'vite'

// GitHub Pages base path - change to '/' if using custom domain or root GitHub Pages
const base = process.env.NODE_ENV === 'production' ? '/cricfuzz/' : '/'

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name].[ext]',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
      },
    },
  },
  publicDir: 'public',
})

