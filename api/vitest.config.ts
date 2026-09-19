import { defineConfig, type Plugin } from 'vitest/config'
import yaml from '@modyfi/vite-plugin-yaml'
import { parse } from 'graphql'

// same as the tsup build's graphql loader: `.graphql` imports give a DocumentNode
const graphql = (): Plugin => ({
    name: 'graphql',
    transform(code, id) {
        if (id.endsWith('.graphql')) {
            const document = parse(code, { noLocation: true })
            return { code: `export default ${JSON.stringify(document)}`, map: null }
        }
    }
})

export default defineConfig({
    // same as the tsup build: allow importing `.yml` and `.graphql` files
    plugins: [yaml(), graphql()],
    test: {
        include: ['src/**/*.test.ts']
    }
})
