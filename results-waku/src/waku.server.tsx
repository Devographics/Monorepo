import adapter from 'waku/adapters/default'
import { createPages } from 'waku'
import { RootLayout } from './templates/root-layout'
import { LocalizedPage } from './templates/localized-page'
import { HomePage } from './templates/home-page'

// export default adapter(handler)

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
        staticPaths: [['en-US', 'features']]
    })
])

export default adapter(pages)
