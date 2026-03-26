import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Config } from 'waku/config'
import yaml from '@modyfi/vite-plugin-yaml'

const graphqlDocumentPlugin = () => ({
    name: 'graphql-document',
    enforce: 'pre' as const,
    transform(source, id) {
        if (!id.endsWith('.graphql')) {
            return null
        }
        return {
            code: `export default ${JSON.stringify(source)};`,
            map: null
        }
    }
})

const envPlugin = () => ({
    name: 'env',
    config(_: unknown, { command }: { command: string }) {
        // Load .env file for only dev server, not for build.
        if (command !== 'serve') return
        const define: Record<string, string> = {}
        try {
            const content = readFileSync(resolve(process.cwd(), '.env'), 'utf-8')
            for (const line of content.split('\n')) {
                const match = line.match(/^([^#=\s][^=]*)=(.*)$/)
                if (match) {
                    const [, key, value] = match
                    define[`process.env.${key.trim()}`] = JSON.stringify(value.trim())
                }
            }
        } catch {}
        return { define }
    }
})

export default {
    vite: {
        plugins: [graphqlDocumentPlugin(), envPlugin(), yaml()]
    }
} satisfies Config
