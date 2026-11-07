import { surveyColorTheme } from 'Theme/colors'
import { getColorFromThemes } from './helpers'

export { defaultColorTheme } from './defaultColorTheme'

// note: survey theme files (surveys/*/theme) must not import this file,
// use getColorFromThemes from ./helpers instead to avoid an import cycle
export const getThemeColor = (colorPath: string) =>
    getColorFromThemes(surveyColorTheme, colorPath)
