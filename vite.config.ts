import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './i18n.inlang',
      outdir: './src/lib/paraglide',
      strategy: ["cookie", "url", 'baseLocale'],
      urlPatterns: [
        {
          pattern: "/:path(.*)?",
          localized: [
            ["de", "/de/:path(.*)?"],
            // ✅ make sure to match the least specific path last
            ["en", "/en/:path(.*)?"],
          ],
        },
      ],

    }),
    tailwindcss(),
    sveltekit(),
    nodePolyfills()],
});
