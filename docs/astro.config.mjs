import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import pagefind from 'astro-pagefind';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), tailwind(), pagefind()],
  site: `https://bloomreach.github.io/spa-sdk/docs`,
  base: `spa-sdk/docs`,
  trailingSlash: "ignore",
  redirects: {
    '/': '/spa-sdk/docs/getting-started'
  }
});
