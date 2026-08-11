import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` defaults to '/' for local use. When deploying to GitHub Pages under a
// project path (e.g. /Shyam-Project-One/), the deploy workflow sets VITE_BASE.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: {
    host: true, // allow access from other devices on the home network
    port: 5173,
  },
})
