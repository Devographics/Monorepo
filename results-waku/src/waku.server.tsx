import adapter from 'waku/adapters/default'
import { createPages } from 'waku'
import { RootLayout } from './templates/root-layout'
import { LocalizedPage } from './templates/localized-page'
import { HomePage } from './templates/home-page'
import { loadSitemap } from './load-sitemap'
import { getAllLocales } from './lib/i18n'

const sitemaps = loadSitemap()

const locales = await getAllLocales()

console.log('locales:', locales)

const paths: Array<[locale: string, slug: string]> = sitemaps.map(page => [
    'en-US',
    page.path.replace(/^\/|\/$/g, '') || ''
])

const staticPaths = locales.flatMap<[string, string]>(locale =>
    sitemaps.map(page => [locale.id, page.path.replace(/^\/|\/$/g, '') || ''])
)

console.log('paths:', staticPaths)

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
