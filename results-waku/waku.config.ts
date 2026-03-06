import type { Config } from 'waku/config'
import type { PluginOption } from 'vite'

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

export default {
    vite: {
        plugins: [graphqlDocumentPlugin()]
    }
} satisfies Config
