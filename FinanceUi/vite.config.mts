import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";
import dotenv from 'dotenv'
dotenv.config();
// https://vitejs.dev/config/
console.log(process.env.BASE_PATH)
export default defineConfig({
  base: process.env?.BASE_PATH || "/",
  plugins: [react(), mkcert()],
});
