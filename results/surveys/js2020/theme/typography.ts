import { DefaultTheme } from 'styled-components'

const stateOfJSThemeTypography: DefaultTheme['typography'] = {
    fontFamily: `'IBM Plex Mono', monospace`,
    rootSize: {
        mobile: '13px',
        desktop: '17px',
    },
    size: {
        smaller: '0.7rem',
        small: '0.8rem',
        smallish: '0.9rem',
        medium: '1rem',
        large: '1.1rem',
        larger: '1.3rem',         
        largerer: '1.6rem',
        largest: '2rem',
        huge: '4rem',
    },
    weight: {
        light: 300,
        medium: 400,
        bold: 800,
    },
}

export default stateOfJSThemeTypography
