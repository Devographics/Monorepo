import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Root, Slot } from 'waku/minimal/client'
import { RootLayout } from './templates/root-layout'

const wakuGlobal = globalThis as typeof globalThis & {
  __WAKU_HYDRATE__?: boolean
}

const getInitialRscPath = () => {
  const pathname = window.location.pathname
  if (pathname === '/') {
    return ''
  }
  const match = pathname.match(/^\/([A-Za-z0-9-]+)\/?$/)
  return match ? match[1] : ''
}

const rootElement = (
  <StrictMode>
    <Root initialRscPath={getInitialRscPath()}>
      <RootLayout>
        <Slot id="App" />
      </RootLayout>
    </Root>
  </StrictMode>
)

if (wakuGlobal.__WAKU_HYDRATE__) {
  hydrateRoot(document, rootElement)
} else {
  createRoot(document).render(rootElement)
}
