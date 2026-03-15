import adapter from 'waku/adapters/default'
import { createPages } from 'waku'
import { RootLayout } from './templates/root-layout'
import { LocalizedPage } from './templates/localized-page'
import { HomePage } from './templates/home-page'
import { loadSitemap } from './load-sitemap'

// export default adapter(handler)

const sitemaps = loadSitemap()

const paths: Array<[locale: string, slug: string]> = sitemaps.map(page => [
    'en-US',
    page.path.replace(/^\/|\/$/g, '') || ''
])

console.log('sitemap paths:', paths)

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
        staticPaths: paths
    })
])

export default adapter(pages)
