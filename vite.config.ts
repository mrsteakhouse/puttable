import { sentrySvelteKit } from "@sentry/sveltekit";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    sentrySvelteKit(),
    paraglideVitePlugin({
      project: "./i18n.inlang",
      outdir: "./src/lib/paraglide",
      strategy: ["cookie", "url", "baseLocale"],
      urlPatterns: [
        {
          pattern: "/:path(.*)?",
          localized: [
            ["en", "/en/:path(.*)?"],
            ["fr", "/fr/:path(.*)?"],
            ["es", "/es/:path(.*)?"],
            ["it", "/it/:path(.*)?"],
            // ✅ make sure to match the least specific path last
            ["de", "/:path(.*)?"],
          ],
        },
      ],
    }),
    tailwindcss(),
    sveltekit(),
    nodePolyfills(),
  ],
});
