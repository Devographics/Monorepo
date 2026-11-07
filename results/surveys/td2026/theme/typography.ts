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
    weight: {
        light: 300,
        medium: 400,
        bold: 700
    }
}

export default stateOfCSSThemeTypography
