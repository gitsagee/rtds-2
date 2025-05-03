import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all /search requests to your FastAPI backend
      '/search': {
        target: 'http://localhost:8000', // Your FastAPI server address
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

// Alternatively, if you're using Create React App, you would add this to package.json:
// "proxy": "http://localhost:8000"
