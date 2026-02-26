import adapter from 'waku/adapters/default'
import { Slot } from 'waku/minimal/client'

import { getFallbackLocaleId } from './lib/i18n'
import { HomePage } from './templates/home-page'
import { LocalizedPage } from './templates/localized-page'
import { RootLayout } from './templates/root-layout'

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

const normalizeRscPath = (rscPath?: string) => rscPath?.replace(/^\/|\/$/g, '') || ''

const HOME_ROUTE: RouteMatch = {
  type: 'home',
  rscPath: '',
  htmlPath: 'index.html',
}

const toLocaleRoute = (localeId: string): RouteMatch => ({
  type: 'locale',
  localeId,
  rscPath: localeId,
  htmlPath: `${localeId}/index.html`,
})

const getRouteFromPathname = (pathname: string): RouteMatch | null => {
  if (pathname === '/') {
    return HOME_ROUTE
  }
  const match = pathname.match(/^\/([A-Za-z0-9-]+)\/?$/)
  if (!match) {
    return null
  }
  return toLocaleRoute(match[1])
}

const getRouteFromRscPath = (rscPath?: string): RouteMatch | null => {
  const normalized = normalizeRscPath(rscPath)
  if (!normalized || normalized === 'R/_root') {
    return HOME_ROUTE
  }

  // Router client fetches route payloads with R/<path> encoded ids.
  if (normalized.startsWith('R/')) {
    const decodedPath = normalized.slice(2)
    if (!decodedPath || decodedPath === '_root') {
      return HOME_ROUTE
    }
    return getRouteFromPathname(`/${decodedPath}`)
  }

  // Keep compatibility for direct minimal-client style ids.
  if (/^[A-Za-z0-9-]+$/.test(normalized)) {
    return toLocaleRoute(normalized)
  }

  return null
}

const renderRouteRsc = (route: RouteMatch) => {
  if (route.type === 'locale') {
    return <LocalizedPage locale={route.localeId} />
  }
  return <HomePage />
}

const htmlTemplate = (
  <RootLayout>
    <Slot id="App" />
  </RootLayout>
)

export default adapter({
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
    const routes: RouteMatch[] = [HOME_ROUTE, toLocaleRoute(getFallbackLocaleId())]

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
  },
})
