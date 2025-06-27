import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to fix MIME types
const mimeTypePlugin = () => {
  return {
    name: 'mime-type-fix',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        if (url.includes('/src/') || url.endsWith('.js') || url.endsWith('.jsx') || url.endsWith('.mjs') || url.endsWith('.ts') || url.endsWith('.tsx')) {
          res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
          res.setHeader('X-Content-Type-Options', 'nosniff')
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    }),
    tailwindcss(),
    mimeTypePlugin()
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        format: 'es'
      },
      external: []
    },
    target: 'es2015',
    minify: 'esbuild'
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  define: {
    global: 'globalThis'
  }
})
