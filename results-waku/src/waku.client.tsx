import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Root, Slot } from 'waku/minimal/client'
import { RootLayout } from './templates/root-layout'

const wakuGlobal = globalThis as typeof globalThis & {
    __WAKU_HYDRATE__?: boolean
}

const getInitialRscPath = () => {
    const pathname = window.location.pathname
    const normalized = pathname.replace(/^\/+|\/+$/g, '')
    if (!normalized) {
        return ''
    }
    return normalized
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
