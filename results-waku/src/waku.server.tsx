import adapter from 'waku/adapters/default'
import { createPages } from 'waku'
import { RootLayout } from './templates/root-layout'
import { LocalizedPage } from './templates/localized-page'
import { HomePage } from './templates/home-page'
import { loadSitemap } from './load-sitemap'
import { getAllLocales } from './lib/i18n'
import { formatStaticPathsForLog, type StaticPathTuple } from './lib/static-paths'

const sitemaps = loadSitemap()

const locales = await getAllLocales()

const staticPaths: Array<StaticPathTuple> = locales.flatMap(locale =>
    sitemaps.map(page => [locale.id, page.path.replace(/^\/|\/$/g, '') || ''] as StaticPathTuple)
)

const staticPathTreeLines = formatStaticPathsForLog(staticPaths)
console.log('staticPaths:\n' + staticPathTreeLines.join('\n'))

const pages = createPages(async ({ createPage, createRoot }) => [
    createRoot({
        render: 'static',
        component: RootLayout
    }),

    createPage({
        render: 'static',
        path: '/',
        component: HomePage
    }),

    createPage({
        render: 'static',
        path: '/[locale]/[slug]',
        component: LocalizedPage,
        staticPaths: staticPaths
    })
])

export default adapter(pages)
