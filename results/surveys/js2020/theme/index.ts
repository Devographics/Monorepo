import { DefaultTheme } from 'styled-components'
import colors from './colors'
import typography from './typography'
import charts from './charts'

const stateOfJSTheme: DefaultTheme = {
    typography,
    colors,
    charts,
    separationBorder: `1px solid ${colors.border}`,
    blockShadow: `0px 6px 16px rgba(0, 0, 0, 0.3), 0px 2px 6px rgba(0, 0, 0, 0.2)`,
}

export default stateOfJSTheme