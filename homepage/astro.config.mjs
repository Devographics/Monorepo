import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import yaml from '@rollup/plugin-yaml'

// import netlify from '@astrojs/netlify/functions'

// https://astro.build/config
export default defineConfig({
    // Enable React to support React JSX components.
    integrations: [react()],
    // adapter: netlify()
    vite: {
        plugins: [yaml()],
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler' // or "modern"
                }
            }
        }
    },
    redirects: {
        '/': '/en-US'
    }
})
