import { DefaultTheme } from 'styled-components'
import { getThemeColor } from 'core/theme_new/colors'
import dimensions from './dimensions'
import typography from './typography'
import zIndexes from './zIndexes'

const stateOfCSSTheme: DefaultTheme = {
    dimensions,
    typography,
    zIndexes,
    border: `1px solid ${getThemeColor('border.default')}`,
    separationBorder: `1px dashed ${getThemeColor('border.default')}`,
    blockShadow: `0px 16px 24px rgba(0, 0, 0, 0.4), 0px 2px 6px rgba(0, 0, 0, 0.3)`,
}

export default stateOfCSSTheme