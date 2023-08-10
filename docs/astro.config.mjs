import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
  ],
  site: `https://bloomreach.github.io/spa-sdk/docs`,
  base: `spa-sdk/docs`,
  trailingSlash: "ignore",
  vite: {
    ssr: {
      noExternal: [
        '@docsearch/react',
        '@algolia/autocomplete-core',
        '@algolia/autocomplete-shared',
        'algoliasearch',
        '@algolia/autocomplete-plugin-algolia-insights'
      ]
    }
  }
});
