import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), tailwind()],
  site: `https://bloomreach.github.io/spa-sdk/docs`,
  base: `spa-sdk/docs`,
  trailingSlash: "ignore"
});