import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    /*
     * The HEIC decoder (heic-to) is a ~3 MB WASM bundle. It is deliberately
     * behind a dynamic import in src/lib/loadImage.ts, so it never lands in
     * the initial payload — it is fetched only when someone actually uploads a
     * HEIC that the browser itself cannot decode. The app chunk is ~265 kB.
     */
    chunkSizeWarningLimit: 3500,
  },
})
