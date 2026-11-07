import { ColorTheme } from './types'
import { baseColors } from './base_colors'

const distinct = [
    baseColors.indigo,
    baseColors.teal,
    baseColors.red,
    baseColors.green,
    baseColors.yellow,
    baseColors.pink,
    baseColors.aqua,
    baseColors.orange,
    baseColors.olive,
    baseColors.skyblue,
    baseColors.purple,
    baseColors.blueLighter,
    baseColors.greyTeal,
    baseColors.kaki
]

const primaryDefault = '#38D6FE'
const backgroundDefault = '#272325'

export const defaultColorTheme: ColorTheme = {
    lightOnDark: {
        primary: { default: primaryDefault, darker: '#1c9fc0ff' },
        background: {
            default: backgroundDefault,
            alt: '#3A3444',
            alt2: '#604B81',
            inverted: '#FFF6E6',
            invertedAlt: '#E3D8C4'
        },
        text: {
            default: '#FFF6E6',
            alt: 'rgba(255, 246, 229, 0.5)',
            inverted: backgroundDefault,
            error: '#f7bdbd'
        },
        border: {
            default: '#FFF6E6',
            alt: 'rgba(255, 246, 229, 0.35)',
            hover: primaryDefault
        },
        distinct,
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
