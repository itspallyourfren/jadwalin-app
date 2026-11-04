import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5174,
  },
  // @ts-expect-error vitest options
  test: {
    globals: true,
    environment: 'node',
  },
})
