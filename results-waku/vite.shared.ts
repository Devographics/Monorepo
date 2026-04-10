import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PluginOption, UserConfig } from 'vite'
import yaml from '@modyfi/vite-plugin-yaml'

const graphqlDocumentPlugin = (): PluginOption => ({
    name: 'graphql-document',
    enforce: 'pre',
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

const envPlugin = (): PluginOption => ({
    name: 'env',
    config(_: unknown, { command }: { command: string }) {
        if (command !== 'serve') return
        const define: Record<string, string> = {}
        try {
            const content = readFileSync(resolve(process.cwd(), '.env'), 'utf-8')
            for (const line of content.split('\n')) {
                const match = line.match(/^([^#=\s][^=]*)=(.*)$/)
                if (!match) {
                    continue
                }
                const [, key, value] = match
                const envKey = key.trim()
                const envValue = value.trim()
                process.env[envKey] ||= envValue
                define[`process.env.${envKey}`] = JSON.stringify(envValue)
            }
        } catch {}
        return { define }
    }
})

export const resultsWakuVitePlugins = (): PluginOption[] => [
    graphqlDocumentPlugin(),
    envPlugin(),
    yaml()
]

export const resultsWakuViteConfig = (): UserConfig => ({
    plugins: resultsWakuVitePlugins()
})
