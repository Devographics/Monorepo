import path from 'path'
import { createPagesSingleLoop } from './node_src/create_pages'
import CopyPlugin from 'copy-webpack-plugin'
import dotenv from 'dotenv'
import { CreateWebpackConfigArgs } from 'gatsby'

// Needed only for mjs
// import { createRequire } from 'node:module'
// const require = createRequire(import.meta.url)

// For mjs but Node 20 will reintroduce _dirname/_filename
//import { fileURLToPath } from 'url'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

dotenv.config({
    path: `.env`
})

export const createPages = createPagesSingleLoop

// Allow absolute imports and inject `ENV`
export const onCreateWebpackConfig = ({ stage, actions, plugins }: CreateWebpackConfigArgs) => {
    console.log('THEME', path.resolve(__dirname, `surveys/${process.env.EDITIONID}/theme`))
    actions.setWebpackConfig({
        resolve: {
            alias: {
                // The webpack config is tweaked based en env variable
                // => these assets must keep an "any" type in TS, see src/@types/global.d.ts
                Config: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/config`),
                Theme: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/theme`),
                Logo: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/logo`),
                Images: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/images`),
                Fonts: path.resolve(__dirname, `surveys/${process.env.EDITIONID}/fonts`)
            },
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            fallback: {
                // TODO: normally not needed if server code doesn't leak in client
                // path: require.resolve('path-browserify'),
                // assert: require.resolve('assert-polyfill'),
                // util: require.resolve('util/'),
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

// https://github.com/pixelplicity/gatsby-plugin-plausible/blob/master/src/gatsby-node.js
exports.onPreInit = ({ reporter }, options) => {
    if (!process.env.PLAUSIBLE_DOMAIN) {
        reporter.warn(`The Plausible Analytics plugin requires a domain. Did you mean to add it?`)
    }
}
