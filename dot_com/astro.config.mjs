// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import yaml from '@rollup/plugin-yaml'

// https://astro.build/config
export default defineConfig({
    site: 'https://www.devographics.com',
    // React is only used to server-render the shared survey logos (no client JS)
    integrations: [react()],
    vite: {
        // @devographics/helpers imports a .yml config file
        plugins: [yaml()]
    }
})
