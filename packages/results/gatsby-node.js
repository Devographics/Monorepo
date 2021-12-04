const path = require('path')
const { createPagesSingleLoop, createPagesTwoLoops } = require('./node_src/create_pages')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

require('dotenv').config({
    path: `.env`,
})

exports.createPages = createPagesSingleLoop

// handle 404 page separately
// exports.onCreatePage = async ({ page, actions }) => {
//     const { createPage, deletePage } = actions

//     // Look for /404/ path
//     if (page.path.match(/^\/[a-z]{2}\/404\/$/)) {
//         const oldPage = { ...page }

//         // Add page context stubs to avoid throwing errors
//         page.context = {
//             locales: [],
//             locale: {},
//         }
//         console.log('//404')
//         console.log(page)
//         // Recreate the modified page
//         deletePage(oldPage)
//         createPage(page)
//     }
// }

// exports.onCreatePage = async ({ page, actions }) => {
//     const { createPage, deletePage } = actions
//     // Check if the page is a localized 404
//     if (page.path.match(/404/)) {
//       const oldPage = { ...page }
//       // Get the language code from the path, and match all paths
//       // starting with this code (apart from other valid paths)
//       const langCode = page.path.split(`/`)[1]
//       page.matchPath = `/${langCode}/*`

//       console.log('//404')
//       console.log(page)
//       console.log(langCode)

//       // Recreate the modified page
//       deletePage(oldPage)
//       createPage(page)
//     }
//   }

/**
 * Fix case for pages path, it's not obvious on OSX which is case insensitive,
 * but on some environments (eg. travis), it's a problem.
 *
 * Many pages are created from components, and we use upper first in that case
 * for the file name, so when gatsby generates the static page, it has the same name.
 *
 * Implement the Gatsby API “onCreatePage”.
 * This is called after every page is created.
 */
// exports.onCreatePage = async ({ page, graphql, actions }) => {
//     const { createPage, deletePage } = actions

//     const { flat } = await computeSitemap(rawSitemap)

//     const localesResults = await graphql(`${localesQuery}`)
//     console.log(localesResults)
//     const locales = localesResults.data.surveyApi.locales

//     // handle 404 page separately
//     const is404 = page.path.includes('404')

//     const pagePath = page.path.toLowerCase()
//     const matchingPage = flat.find(p => p.path === (is404 ? '/404/' : pagePath))

//     // if there's no matching page
//     // it means we're dealing with an internal page
//     // thus, we don't create one for each locale
//     if (matchingPage === undefined) {
//         if (pagePath !== page.path) {
//             deletePage(page)
//             createPage({
//                 ...page,
//                 path: pagePath
//             })
//         }
//         return
//     }

//     // add context, required for pagination
//     const context = {
//         ...page.context,
//         ...getPageContext(matchingPage)
//     }
//     const newPage = {
//         ...page,
//         path: pagePath,
//         context
//     }

//     deletePage(page)

//     // create page for each available locale
//     for (let locale of locales) {
//         createPage({
//             ...newPage,
//             path: localizedPath(newPage.path, locale),
//             context: {
//                 ...newPage.context,
//                 locale: locale.locale,
//                 localeLabel: locale.label,
//                 localePath: locale.path === 'default' ? '' : `/${locale.path}`
//             }
//         })
//     }

//     createBlockPages(page, context, createPage)
// }

// Allow absolute imports and inject `ENV`
exports.onCreateWebpackConfig = ({ stage, actions, plugins }) => {
    actions.setWebpackConfig({
        resolve: {
            alias: {
                Config: path.resolve(__dirname, `surveys/${process.env.SURVEY}/config`),
                Theme: path.resolve(__dirname, `surveys/${process.env.SURVEY}/theme`),
                Logo: path.resolve(__dirname, `surveys/${process.env.SURVEY}/logo`),
                Images: path.resolve(__dirname, `surveys/${process.env.SURVEY}/imagess`),
            },
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            fallback: {
                path: require.resolve('path-browserify'),
                assert: require.resolve('assert-polyfill'),
                util: require.resolve('util/'),
                buffer: false,
            },
        },
        plugins: [
            // new webpack.ProvidePlugin({
            //     Buffer: ['buffer', 'Buffer'],
            // }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, `surveys/${process.env.SURVEY}/images`),
                        to: path.resolve(__dirname, `static/images`),
                    },
                ],
            }),
            plugins.define({
                ENV:
                    stage === `develop` || stage === `develop-html`
                        ? `'development'`
                        : `'production'`,
            }),
        ],
    })
}
