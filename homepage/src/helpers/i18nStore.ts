import { atom } from 'nanostores'
import { type i18nContextType } from './translator'

// Store has to live in a separate file
export const i18nStore = atom<i18nContextType>({
    locale: { id: 'en-US', label: 'English' },
    locales: [
        { id: 'en-US', label: 'English' },
        { id: 'es-ES', label: 'Español' }
    ],
    // dummy getString function, will be replaced with the real one in i18nContext.tsx
    getString: (x: string) => ({
        t: x,
        tHtml: x,
        fallback: x,
        locale: { id: 'en-US', label: 'English' }
    })
})