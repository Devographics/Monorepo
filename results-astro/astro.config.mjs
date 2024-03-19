import { defineConfig } from 'astro/config';
// @see https://docs.astro.build/en/recipes/add-yaml-support/
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [yaml()]
    }
    // we do NOT setup i18n here
    // black box i18n redirection are hard to decipher
    // and show an eratic behaviour during dev
    // Use Astro.params to access the current locale easily
});
