import { defineConfig } from 'astro/config';
// @see https://docs.astro.build/en/recipes/add-yaml-support/
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [yaml()]
    }
});
