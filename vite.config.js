import { defineConfig } from 'vite'

// GitHub Pages base path - change to '/' if using custom domain or root GitHub Pages
// Use environment variable or default to '/cricfuzz/' for production
const base = process.env.GITHUB_PAGES_BASE || (process.env.NODE_ENV === 'production' ? '/cricfuzz/' : '/')

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
    cssCodeSplit: false, // Ensure CSS is in a single file
  },
  publicDir: 'public',
})

