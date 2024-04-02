import path from "path"
import dotenv from 'dotenv'


// For mjs and Node <20, not needed in TS or with Node 20+
// import path from 'path'
//import { fileURLToPath } from 'url'
//const __filename = fileURLToPath(import.meta.url)
//const __dirname = path.dirname(__filename)

const envPath = process.env.ENV_FILE ? process.env.ENV_FILE : '.env'
dotenv.config({ path: envPath })

function checkEnv() {
    const errors: Array<string> = []
    if (!process.env.GATSBY_API_URL) {
        errors.push('Missing GATSBY_API_URL')
    }
    if (errors.length) {
        throw new Error(errors.join('\n'))
    }
}
checkEnv()

export default {
    flags: {
        // DEV_SSR: true
    },
    siteMetadata: {
        title: `Devographics Survey Results`
    },
    plugins: [
        'gatsby-plugin-pnpm',
        'gatsby-transformer-yaml',
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: `data`,
                path: path.resolve(__dirname, "./src/data/")
            }
        },
        {
            resolve: 'gatsby-source-graphql',
            options: {
                typeName: 'DataAPI',
                fieldName: 'dataAPI',
                url: process.env.GATSBY_API_URL
            }
        },
        'gatsby-plugin-react-helmet',
        'gatsby-plugin-sass',
        // { resolve: 'gatsby-plugin-netlify', options: {} },
        'gatsby-plugin-styled-components',
        `gatsby-plugin-mdx`,
        'gatsby-plugin-bundle-stats',
        // `gatsby-plugin-perf-budgets`,
        // `gatsby-plugin-webpack-bundle-analyser-v2`,
        // {
        //     resolve: 'gatsby-plugin-fathom',
        //     options: {
        //         // Your custom domain, defaults to `cdn.usefathom.com`
        //         trackingUrl: 'cdn.usefathom.com',
        //         // Unique site id
        //         siteId: process.env.FATHOM_ID
        //     }
        // },
        {
            resolve: `gatsby-plugin-plausible`,
            options: {
                domain: process.env.PLAUSIBLE_DOMAIN
            }
        }
    ]
}
