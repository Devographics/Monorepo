import { Slot } from 'waku/minimal/client'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

import { getAllLocales, getFallbackLocaleId } from './lib/i18n'
import { HomePage } from './templates/home-page'
import { LocalizedPage } from './templates/localized-page'
import { SitemapPage } from './templates/sitemap-page'
import { RootLayout } from './templates/root-layout'
import { Unstable_Handlers } from 'node_modules/waku/dist/lib/types'

type RouteMatch =
    | {
          type: 'home'
          rscPath: ''
          htmlPath: 'index.html'
      }
    | {
          type: 'locale'
          localeId: string
          rscPath: string
          htmlPath: string
      }
    | {
          type: 'sitemap'
          localeId: string
          pageId: string
          path: string
          blocks?: Array<SitemapBlock>
          rscPath: string
          htmlPath: string
      }

type SitemapBlock = {
    id?: string
    template?: string
    blockType?: string
    [key: string]: unknown
}

type RawSitemapPage = {
    id?: string
    path?: string
    blocks?: Array<SitemapBlock>
    children?: Array<RawSitemapPage>
}

type SitemapPageRecord = {
    id: string
    path: string
    blocks: Array<SitemapBlock>
}

const normalizeRscPath = (rscPath?: string) => rscPath?.replace(/^\/|\/$/g, '') || ''

const SURVEYID = process.env.SURVEYID || 'state_of_js'
const EDITIONID = process.env.EDITIONID || 'js2025'
const SERVER_DIR = dirname(fileURLToPath(import.meta.url))

const RAW_SITEMAP_PATH = resolve(SERVER_DIR, 'surveys', EDITIONID, 'config', 'raw_sitemap.yml')

if (!RAW_SITEMAP_PATH) {
    console.warn(`Unable to locate raw_sitemap.yml for edition ${EDITIONID}`)
}

const normalizeSitemapPath = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || trimmed === '/') return '/'
    const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    const noTrailingSlash = withLeadingSlash.replace(/\/+$/g, '')
    return `${noTrailingSlash}/`
}

const joinSitemapPath = (parentPath: string, childPath: string) => {
    if (!childPath) return parentPath || '/'
    const normalizedChild = normalizeSitemapPath(childPath).replace(/^\/|\/$/g, '')
    if (!parentPath || parentPath === '/') {
        return normalizeSitemapPath(`/${normalizedChild}`)
    }
    return normalizeSitemapPath(`${parentPath.replace(/\/+$/g, '')}/${normalizedChild}`)
}

const loadSitemap = (): Array<SitemapPageRecord> => {
    if (!RAW_SITEMAP_PATH || !existsSync(RAW_SITEMAP_PATH)) {
        console.error(`raw_sitemap.yml not found at expected path: ${RAW_SITEMAP_PATH}`)
        return []
    }

    try {
        const raw = readFileSync(RAW_SITEMAP_PATH, 'utf8')
        const rawSitemap = yaml.load(raw) as Array<RawSitemapPage>
        if (!Array.isArray(rawSitemap)) return []

        const map = new Map<string, SitemapPageRecord>()

        const visit = (pages: Array<RawSitemapPage>, parentPath = '') => {
            for (const page of pages) {
                const rawPath =
                    typeof page?.path === 'string' && page.path.trim() !== ''
                        ? page.path
                        : typeof page?.id === 'string' && page.id.trim() !== ''
                        ? `/${page.id}`
                        : '/'

                const pagePath = joinSitemapPath(parentPath, rawPath)
                const pageId =
                    typeof page?.id === 'string' && page.id.trim() !== ''
                        ? page.id
                        : `page-${map.size + 1}`
                const blocks = Array.isArray(page?.blocks) ? page.blocks : []
                if (!map.has(pagePath)) {
                    map.set(pagePath, { id: pageId, path: pagePath, blocks })
                }

                if (Array.isArray(page.children) && page.children.length > 0) {
                    visit(page.children, pagePath)
                }
            }
        }

        visit(rawSitemap)
        return Array.from(map.values())
    } catch (error) {
        console.warn(`Failed to load raw sitemap at ${RAW_SITEMAP_PATH}`)
        console.warn(error)
        return []
    }
}

const sitemapPages = loadSitemap()

const findSitemapPage = (pagePath: string) =>
    sitemapPages.find(page => page.path === normalizeSitemapPath(pagePath)) ?? null

const toSitemapRoute = (localeId: string, page: SitemapPageRecord): RouteMatch => {
    const pagePath = normalizeSitemapPath(page.path)
    const normalizedPath =
        pagePath === '/' ? localeId : `${localeId}/${pagePath.replace(/^\/+|\/+$/g, '')}`
    return {
        type: 'sitemap',
        localeId,
        pageId: page.id,
        path: pagePath,
        blocks: page.blocks,
        rscPath: normalizedPath,
        htmlPath: `${normalizedPath}/index.html`
    }
}

const HOME_ROUTE: RouteMatch = {
    type: 'home',
    rscPath: '',
    htmlPath: 'index.html'
}

const toLocaleRoute = (localeId: string): RouteMatch => ({
    type: 'locale',
    localeId,
    rscPath: localeId,
    htmlPath: `${localeId}/index.html`
})

const parseLocalePath = (pathname: string): { localeId: string; pagePath: string } | null => {
    if (pathname === '/') {
        return null
    }

    const normalized = pathname.replace(/^\/+|\/+$/g, '')
    const match = normalized.match(/^([A-Za-z0-9-]+)(?:\/(.*))?$/)
    if (!match) {
        return null
    }

    const [, localeId, pagePath = ''] = match
    return {
        localeId,
        pagePath: pagePath ? `/${pagePath}` : '/'
    }
}

const getRouteFromPathname = (pathname: string): RouteMatch | null => {
    if (pathname === '/') {
        return HOME_ROUTE
    }

    const parsed = parseLocalePath(pathname)
    if (!parsed) {
        return null
    }
    if (parsed.pagePath === '/') {
        return toLocaleRoute(parsed.localeId)
    }

    const page = findSitemapPage(parsed.pagePath)
    if (!page) {
        return toSitemapRoute(parsed.localeId, {
            id: 'missing',
            path: parsed.pagePath,
            blocks: []
        })
    }

    return toSitemapRoute(parsed.localeId, page)
}

const getRouteFromRscPath = (rscPath?: string): RouteMatch | null => {
    const normalized = normalizeRscPath(rscPath)
    if (!normalized || normalized === 'R/_root') {
        return HOME_ROUTE
    }

    // Router client fetches route payloads with R/<path> encoded ids.
    if (normalized.startsWith('R/')) {
        const decodedPath = decodeURIComponent(normalized.slice(2))
        if (!decodedPath || decodedPath === '_root') {
            return HOME_ROUTE
        }
        return getRouteFromPathname(`/${decodedPath}`)
    }

    return getRouteFromPathname(`/${normalized}`)
}

const renderRouteRsc = (route: RouteMatch) => {
    if (route.type === 'locale') {
        return <LocalizedPage locale={route.localeId} />
    }
    if (route.type === 'sitemap') {
        return (
            <SitemapPage
                locale={route.localeId}
                path={route.path}
                pageId={route.pageId}
                blocks={route.blocks}
                surveyId={SURVEYID}
                editionId={process.env.EDITIONID}
            />
        )
    }
    return <HomePage />
}

const getBuildRoutes = async () => {
    const locales = await getAllLocales().catch(() => [{ id: getFallbackLocaleId() }])
    const localeIds = Array.from(
        new Set([getFallbackLocaleId(), ...locales.map(item => item.id || '').filter(Boolean)])
    )

    const routes: Array<RouteMatch> = [HOME_ROUTE]
    const seen = new Set([''])

    for (const localeId of localeIds) {
        const localeRoute = toLocaleRoute(localeId)
        if (!seen.has(localeRoute.rscPath)) {
            routes.push(localeRoute)
            seen.add(localeRoute.rscPath)
        }

        for (const page of sitemapPages) {
            if (page.path === '/') continue
            const pageRoute = toSitemapRoute(localeId, page)
            if (!seen.has(pageRoute.rscPath)) {
                routes.push(pageRoute)
                seen.add(pageRoute.rscPath)
            }
        }
    }

    return routes
}

const htmlTemplate = (
    <RootLayout>
        <Slot id="App" />
    </RootLayout>
)

export const handler: Unstable_Handlers = {
    handleRequest: async (input, { renderRsc, renderHtml }) => {
        if (input.type === 'component') {
            const route = getRouteFromRscPath(input.rscPath)
            if (!route) {
                return
            }
            return renderRsc({ App: renderRouteRsc(route) })
        }

        if (input.type === 'custom') {
            const route = getRouteFromPathname(input.pathname)
            if (!route) {
                return
            }
            const stream = await renderRsc({ App: renderRouteRsc(route) })
            return renderHtml(stream, htmlTemplate, { rscPath: route.rscPath })
        }
    },
    handleBuild: async ({ rscPath2pathname, renderRsc, renderHtml, generateFile }) => {
        const routes = await getBuildRoutes()

        for (const route of routes) {
            const stream = await renderRsc({ App: renderRouteRsc(route) })
            const [rscStream, htmlStream] = stream.tee()
            await generateFile(rscPath2pathname(route.rscPath), rscStream)
            const html = await renderHtml(htmlStream, htmlTemplate, { rscPath: route.rscPath })
            if (!html.body) {
                throw new Error(`Failed to render html body for route: ${route.htmlPath}`)
            }
            await generateFile(route.htmlPath, html.body)
        }
    }
}
