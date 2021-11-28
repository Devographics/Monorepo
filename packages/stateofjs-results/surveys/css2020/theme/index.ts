import { DefaultTheme } from 'styled-components'
import colors from './colors'
import dimensions from './dimensions'
import typography from './typography'
import charts from './charts'
import zIndexes from './zIndexes'

const stateOfCSSTheme: DefaultTheme = {
    dimensions,
    typography,
    colors,
    charts,
    zIndexes,
    separationBorder: `1px dashed ${colors.border}`,
    blockShadow: `0px 16px 24px rgba(0, 0, 0, 0.4), 0px 2px 6px rgba(0, 0, 0, 0.3)`,
}

export default stateOfCSSTheme