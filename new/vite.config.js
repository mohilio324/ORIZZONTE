import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // Set base to '/' for Vercel (GitHub Pages usually required a project name here)
    base: '/',
    build: {
        // This ensures your build files go into the 'dist' folder which Vercel expects
        outDir: 'dist',
    }
})