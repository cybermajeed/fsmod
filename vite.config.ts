import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: "src/main.tsx",
      output: {
        entryFileNames: "content.js",
        assetFileNames: "content.[ext]",
      },
    },
  },
});
