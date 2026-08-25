import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  assetsInclude: ['**/*.py'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Local API functions (api/bfl, api/claude, etc.) aren't served by plain
    // `vite`/`pnpm dev` — run `vercel dev --listen 3001` alongside this
    // dev server to have those requests actually resolve.
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
})
