import { DefaultTheme } from 'styled-components'
import colors from './colors'
import typography from './typography'
import charts from './charts'

const stateOfCSSTheme: DefaultTheme = {
    typography,
    colors,
    charts,
    border: `1px solid ${colors.border}`,
    separationBorder: `1px dashed ${colors.border}`,
    blockShadow: `0px 16px 24px rgba(0, 0, 0, 0.4), 0px 2px 6px rgba(0, 0, 0, 0.3)`
}

export default stateOfCSSTheme
