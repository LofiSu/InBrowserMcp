import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// 模拟__dirname，因为Vite在ESM模式下运行
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === "development",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "background" || chunkInfo.name === "content"
            ? "src/[name].js"
            : "assets/[name]-[hash].js";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
