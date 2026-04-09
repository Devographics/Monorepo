import adapter from 'waku/adapters/default'
import { createPages } from 'waku'
import { AppName } from '@devographics/types'
import { RootLayout } from './templates/root-layout'
import { LocalizedPage } from './templates/localized-page'
import { HomePage } from './templates/home-page'
import { loadSitemap } from './load-sitemap'
import { getAllLocales } from './lib/i18n'
import { formatStaticPathsForLog, type StaticPathTuple } from './lib/static-paths'
import path from 'node:path'

const EDITIONID = process.env.EDITIONID || 'js2025'
const STATIC_BUID_SITEMAP_PATH = path.resolve(`./src/surveys/${EDITIONID}/config/raw_sitemap.yml`)

process.env.APP_NAME ||= AppName.RESULTS

const sitemaps = loadSitemap(STATIC_BUID_SITEMAP_PATH)

const locales = await getAllLocales()

console.log('[waku.server] locales', locales.length, locales.map(locale => locale.id).slice(0, 20))

const staticPaths: Array<StaticPathTuple> = locales.flatMap(locale =>
    sitemaps
        .map(page => [locale.id, page.path.replace(/^\/|\/$/g, '') || ''] as StaticPathTuple)
        .filter(([_, path]) => path !== '')
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
