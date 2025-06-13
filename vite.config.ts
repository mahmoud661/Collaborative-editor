import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //make accessable form the local network
server: {
  host: '0.0.0.0'
} 
})
