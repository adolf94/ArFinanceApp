import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";
import dotenv from 'dotenv'

// https://vitejs.dev/config/
dotenv.config();

export default defineConfig({
    base: process.env?.VITE_BASE_PATH || "/",
    build: { sourcemap:true},
    plugins: [react(), mkcert()],
})
