import { Component, StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Router } from 'waku/router/client'

const wakuGlobal = globalThis as typeof globalThis & {
    __WAKU_HYDRATE__?: boolean
}

const rootElement = (
    <StrictMode>
        <Router />
    </StrictMode>
)

if (wakuGlobal.__WAKU_HYDRATE__) {
    hydrateRoot(document, rootElement)
} else {
    createRoot(document).render(rootElement)
}
