import { defineConfig } from "vite";

const siteBase = process.env.SITE_BASE ?? "/";

export default defineConfig({
  base: siteBase,
  build: {
    assetsInlineLimit: 0,
    sourcemap: false,
  },
});
