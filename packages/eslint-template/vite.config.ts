import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

const baseUrl = new URL(".", import.meta.url)
const normalizePath = (value: string): string =>
  value.startsWith("/") && value.includes(":") ? value.slice(1) : value
const resolvePath = (relative: string): string =>
  normalizePath(decodeURIComponent(new URL(relative, baseUrl).pathname))

export default defineConfig({
  plugins: [tsconfigPaths()],
  publicDir: false,
  resolve: {
    alias: {
      "@": resolvePath("src")
    }
  },
  build: {
    target: "node20",
    outDir: "dist",
    sourcemap: true,
    ssr: "src/rules/main.ts",
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "main.js"
      }
    }
  },
  ssr: {
    target: "node"
  }
})
