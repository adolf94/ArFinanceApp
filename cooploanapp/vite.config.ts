import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";
import dotenv from 'dotenv'

// https://vitejs.dev/config/
dotenv.config();


console.info(`Output basePath: ${process.env?.VITE_LOANS_PATH }`)

export default defineConfig({
    base: process.env?.VITE_LOANS_PATH || "/",
    build: { sourcemap:true},
    plugins: [react(), mkcert()],
})
