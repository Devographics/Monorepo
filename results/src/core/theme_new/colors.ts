import { surveyColorTheme } from 'Theme/colors'
import get from 'lodash/get'

export const defaultColorTheme = {
    lightOnDark: {
        primary: { default: '#38D6FE', darker: '#1c9fc0ff' },
        background: { default: '#272325', alt: '#3A3444', alt2: '#604B81' },
        text: { default: '#FFF6E6' },
        experience: {
            heard: '#AEEFFF',
            used: '#129DC0',
            never_heard: '#8B8085'
        },
        sentiment: {
            positive: '#5ce593',
            negative: '#e45959',
            neutral: '#8B8085'
        },
        velocity: [
            '#06513F',
            '#087258',
            '#0C8C6D',
            '#16AF8A',
            '#23D2A8',
            '#34E1B7',
            '#51F2CB',
            '#75FBDA',
            '#A1FFE8',
            '#C9FFF2',
            '#c9f7ff',
            '#d7e7fe',
            '#E9DCFF',
            '#DCC7FF'
        ]
    }
}

export const getThemeColor = (colorPath: string) => {
    const defaultColor = get(defaultColorTheme, 'lightOnDark.' + colorPath)
    const surveyColor = get(surveyColorTheme, 'lightOnDark.' + colorPath)
    return surveyColor || defaultColor
}
