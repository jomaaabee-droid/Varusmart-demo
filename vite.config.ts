import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Project site: https://jomaaabee-droid.github.io/Varusmart-demo/
// The same base is used for dev, preview, and the GitHub Pages build.
const pagesBase = '/Varusmart-demo/'

export default defineConfig({
  base: pagesBase,
  plugins: [react(), tailwindcss()],
  server: { host: '0.0.0.0', port: 43123, strictPort: true },
  preview: { host: '0.0.0.0', port: 43123, strictPort: true },
})
