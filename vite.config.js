import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          radix:  ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tooltip',
                   '@radix-ui/react-tabs', '@radix-ui/react-switch', '@radix-ui/react-dropdown-menu',
                   '@radix-ui/react-popover', '@radix-ui/react-scroll-area', '@radix-ui/react-progress',
                   '@radix-ui/react-separator', '@radix-ui/react-label', '@radix-ui/react-checkbox'],
          utils:  ['axios', 'moment', 'moment-timezone', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
  },
})
