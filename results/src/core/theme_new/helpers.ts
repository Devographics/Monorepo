import get from 'lodash/get'
import { SurveyColorTheme } from './types'
import { defaultColorTheme } from './defaultColorTheme'

/*

Get a color from a survey's color theme, falling back to the default theme.

This file must not import Theme/colors: survey theme files import it, so
doing so would create an import cycle.

*/
export const getColorFromThemes = (surveyColorTheme: SurveyColorTheme, colorPath: string) => {
    const defaultColor = get(defaultColorTheme, 'lightOnDark.' + colorPath)
    const surveyColor = get(surveyColorTheme, 'lightOnDark.' + colorPath)
    const color = surveyColor || defaultColor
    if (!color) {
        throw new Error(`Could not find color for path ${colorPath}`)
    }
    return color
}
