import { DefaultTheme } from 'styled-components'

const fontFamily = `Inter var, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI,
Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji,
Segoe UI Symbol, Noto Color Emoji`

const stateOfCSSThemeTypography: DefaultTheme['typography'] = {
    fontFamily,
    fontFamily2: fontFamily,
    rootSize: {
        mobile: '13px',
        desktop: '15px'
    },
    size: {
        smallest: '0.5rem',
        smaller: '0.75rem',
        small: '0.8rem',
        smallish: '0.9rem',
        medium: '1rem',
        large: '1.1rem',
        larger: '1.3rem',
        largerer: '1.6rem',
        largest: '2rem',
        largerest: '2.5rem',
        huge: '4rem',
        huger: '5rem',
        hugest: '6rem'
    },
    weight: {
        light: 300,
        medium: 400,
        bold: 800
    }
}

export default stateOfCSSThemeTypography
