import path from 'path'
import { createPagesSingleLoop } from './node_src/create_pages.mjs'
import CopyPlugin from 'copy-webpack-plugin'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

dotenv.config({
    path: `.env`
})

export const createPages = createPagesSingleLoop

// Allow absolute imports and inject `ENV`
export const onCreateWebpackConfig = ({ stage, actions, plugins }) => {
    actions.setWebpackConfig({
        resolve: {
            alias: {
                Config: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/config`),
                Theme: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/theme`),
                Logo: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/logo`),
                Images: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/images`)
            },
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            fallback: {
                path: require.resolve('path-browserify'),
                assert: require.resolve('assert-polyfill'),
                util: require.resolve('util/'),
                buffer: false
            }
        },
        plugins: [
            // new webpack.ProvidePlugin({
            //     Buffer: ['buffer', 'Buffer'],
            // }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/images`),
                        to: path.resolve(__dirname, `static/images`)
                    }
                ]
            }),
            plugins.define({
                ENV:
                    stage === `develop` || stage === `develop-html`
                        ? `'development'`
                        : `'production'`
            })
        ]
    })
}
