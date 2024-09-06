import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env?.BASE_PATH || "/",
  plugins: [react(), mkcert()],
});
