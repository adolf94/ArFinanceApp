import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";
import dotenv from 'dotenv'
import { VitePWA } from "vite-plugin-pwa";
dotenv.config();
// https://vitejs.dev/config/

const pwaConfig = {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    manifest: {
        name: 'AR Finance App',
        short_name: 'FinanceApp',
        theme_color: '#ffffff',
        icons: [
            {
                src: 'pwa-64x64.png',
                sizes: '64x64',
                type: 'image/png'
            },
            {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
            },
            {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: 'maskable-icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ],
    },
}

console.log(process.env.VITE_BASE_PATH)
export default defineConfig({
    base: process.env?.VITE_BASE_PATH || "/",
    build: { sourcemap:true},
    plugins: [react(), mkcert(), ,
        VitePWA(pwaConfig)],
});
